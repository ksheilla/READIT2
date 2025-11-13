const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');
const helmet = require('helmet');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');

dotenv.config();

const app = express();

// IMPORTANT: Configure Helmet to allow audio files
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false
}));

// IMPORTANT: Configure CORS - Updated with your Vercel domain
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://readit-2-njhz8dgzw-sheillas-projects-1b9c87b7.vercel.app',
  /readit-2-.*\.vercel\.app$/,  // Allow all Vercel preview deployments
  process.env.FRONTEND_URL
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.some(allowed => {
      if (allowed instanceof RegExp) return allowed.test(origin);
      return allowed === origin;
    })) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Range'],
  exposedHeaders: ['Content-Range', 'Accept-Ranges', 'Content-Length']
}));

app.use(express.json());

// Initialize Supabase client with service role key for storage
const supabase = createClient(
  process.env.SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY
);

// Configure multer for memory storage (we'll upload to Supabase)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/wav', 'audio/ogg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only audio files are allowed.'));
    }
  }
});

app.get('/', (req, res) => {
  res.send('READit2 API is running successfully with Supabase Storage! 🎤');
});

// User registration
app.post('/api/register', async (req, res) => {
  const { email, password, name, school } = req.body;
  
  if (!email || !password || !name || !school) {
    return res.status(400).json({ 
      error: 'All fields are required: email, password, name, and school' 
    });
  }
  
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();
      
    if (existingUser) {
      return res.status(400).json({ 
        error: 'Email already registered. Please use a different email.' 
      });
    }
    
    const { data, error } = await supabase
      .from('users')
      .insert([
        { 
          email, 
          password_hash: hashedPassword, 
          name, 
          school 
        }
      ])
      .select('id, email, name, school');
      
    if (error) {
      console.error('Database error during registration:', error);
      return res.status(500).json({ 
        error: 'Registration failed. Please try again later.' 
      });
    }
    
    console.log('New user registered:', data[0].email);
    res.status(201).json({ 
      message: 'Registration successful', 
      user: data[0] 
    });
    
  } catch (err) {
    console.error('Server error during registration:', err);
    res.status(500).json({ 
      error: 'Server error. Please try again later.' 
    });
  }
});

// User login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ 
      error: 'Email and password are required' 
    });
  }
  
  try {
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
      
    if (userError || !user) {
      return res.status(401).json({ 
        error: 'Invalid email or password' 
      });
    }
    
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ 
        error: 'Invalid email or password' 
      });
    }
    
    const { password_hash, ...userData } = user;
    
    console.log('User logged in:', userData.email);
    res.json({ 
      message: 'Login successful', 
      user: userData 
    });
    
  } catch (err) {
    console.error('Server error during login:', err);
    res.status(500).json({ 
      error: 'Server error. Please try again later.' 
    });
  }
});

// Upload audio file to Supabase Storage
app.post('/api/upload-audio', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        error: 'No audio file provided' 
      });
    }
    
    // Generate unique filename
    const fileExt = req.file.originalname.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `reflections/${fileName}`;
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('audio-reflections')
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      console.error('Supabase storage error:', error);
      return res.status(500).json({ 
        error: 'Failed to upload audio. Please try again.' 
      });
    }
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('audio-reflections')
      .getPublicUrl(filePath);
    
    console.log('Audio file uploaded:', fileName);
    res.json({ 
      message: 'Audio uploaded successfully',
      audioUrl: urlData.publicUrl,
      filename: fileName
    });
    
  } catch (err) {
    console.error('Error uploading audio:', err);
    res.status(500).json({ 
      error: 'Failed to upload audio. Please try again.' 
    });
  }
});

// Get all reflections
app.get('/api/reflections', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('reflections')
      .select(`
        *,
        users(name, school)
      `)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Database error fetching reflections:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch reflections. Please try again later.' 
      });
    }
    
    console.log(`Fetched ${data?.length || 0} reflections`);
    res.json(data || []);
  } catch (err) {
    console.error('Server error fetching reflections:', err);
    res.status(500).json({ 
      error: 'Server error. Please try again later.' 
    });
  }
});

// Create a new reflection (with optional audio)
app.post('/api/reflections', async (req, res) => {
  const { user_id, book_title, reflection_text, audio_url } = req.body;
  
  if (!user_id || !book_title) {
    return res.status(400).json({ 
      error: 'user_id and book_title are required' 
    });
  }
  
  if (!reflection_text && !audio_url) {
    return res.status(400).json({ 
      error: 'Either reflection_text or audio_url is required' 
    });
  }
  
  try {
    const { data, error } = await supabase
      .from('reflections')
      .insert([
        { 
          user_id, 
          book_title, 
          reflection_text: reflection_text || '',
          audio_url: audio_url || null
        }
      ])
      .select();
      
    if (error) {
      console.error('Database error saving reflection:', error);
      return res.status(500).json({ 
        error: 'Failed to save reflection. Please try again later.' 
      });
    }
    
    console.log('Reflection saved successfully:', data[0].id, audio_url ? '(with audio)' : '');
    res.status(201).json(data[0]);
  } catch (err) {
    console.error('Server error saving reflection:', err);
    res.status(500).json({ 
      error: 'Server error. Please try again later.' 
    });
  }
});

// Get all recommendations
app.get('/api/recommendations', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('recommendations')
      .select(`
        *,
        users(name, school)
      `)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Database error fetching recommendations:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch recommendations. Please try again later.' 
      });
    }
    
    console.log(`Fetched ${data?.length || 0} recommendations`);
    res.json(data || []);
  } catch (err) {
    console.error('Server error fetching recommendations:', err);
    res.status(500).json({ 
      error: 'Server error. Please try again later.' 
    });
  }
});

// Create a new recommendation
app.post('/api/recommendations', async (req, res) => {
  const { user_id, book_title, author, genre, recommendation_text } = req.body;
  
  if (!user_id || !book_title || !recommendation_text) {
    return res.status(400).json({ 
      error: 'Required fields: user_id, book_title, and recommendation_text' 
    });
  }
  
  try {
    const { data, error } = await supabase
      .from('recommendations')
      .insert([
        { 
          user_id, 
          book_title, 
          author,
          genre,
          recommendation_text 
        }
      ])
      .select();
      
    if (error) {
      console.error('Database error saving recommendation:', error);
      return res.status(500).json({ 
        error: 'Failed to save recommendation. Please try again later.' 
      });
    }
    
    console.log('Recommendation saved successfully:', data[0].id);
    res.status(201).json(data[0]);
  } catch (err) {
    console.error('Server error saving recommendation:', err);
    res.status(500).json({ 
      error: 'Server error. Please try again later.' 
    });
  }
});

// Get user badges
app.get('/api/badges/:userId', async (req, res) => {
  const { userId } = req.params;
  
  try {
    const { data, error } = await supabase
      .from('badges')
      .select('*')
      .eq('user_id', userId)
      .order('earned_at', { ascending: false });
      
    if (error) {
      console.error('Database error fetching badges:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch badges. Please try again later.' 
      });
    }
    
    res.json(data || []);
  } catch (err) {
    console.error('Server error fetching badges:', err);
    res.status(500).json({ 
      error: 'Server error. Please try again later.' 
    });
  }
});

// Get leaderboard
app.get('/api/leaderboard', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, school, current_streak')
      .order('current_streak', { ascending: false })
      .limit(10);
      
    if (error) {
      console.error('Database error fetching leaderboard:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch leaderboard. Please try again later.' 
      });
    }
    
    res.json(data);
  } catch (err) {
    console.error('Server error fetching leaderboard:', err);
    res.status(500).json({ 
      error: 'Server error. Please try again later.' 
    });
  }
});

app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found. Please check the URL and try again.' 
  });
});

app.use((err, req, res, next) => {
  console.error('Global server error:', err);
  res.status(500).json({ 
    error: 'An unexpected error occurred. Please try again later.' 
  });
});

const PORT = process.env.PORT || 5000;

// Determine the base URL for logging
let baseUrl = `http://localhost:${PORT}`;
if (process.env.RAILWAY_PUBLIC_DOMAIN) {
  baseUrl = `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`;
} else if (process.env.RENDER_EXTERNAL_URL) {
  baseUrl = process.env.RENDER_EXTERNAL_URL;
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🎤 READit2 Server is running on port ${PORT}`);
  console.log('===================================================');
  console.log(`API Base URL: ${baseUrl}/api`);
  console.log('Storage: Supabase Storage (audio-reflections bucket)');
  console.log('===================================================');
  console.log('Available endpoints:');
  console.log('  - POST /api/register');
  console.log('  - POST /api/login');
  console.log('  - POST /api/upload-audio 🎤');
  console.log('  - GET /api/reflections');
  console.log('  - POST /api/reflections');
  console.log('  - GET /api/recommendations');
  console.log('  - POST /api/recommendations');
  console.log('  - GET /api/badges/:userId');
  console.log('  - GET /api/leaderboard');
  console.log('===================================================');
});