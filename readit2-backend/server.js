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

// Configure Helmet for security + allow cross-origin media
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginEmbedderPolicy: false,
}));

// ✅ CORS middleware — handles preflight OPTIONS automatically
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (e.g., mobile apps, curl, tests)
    if (!origin) return callback(null, true);

    console.log('🌐 Incoming origin:', origin);

    // ✅ Allowlist of trusted origins
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://readit-2.vercel.app',
      'https://readit2-2.vercel.app',
      'https://readit2-git-main-sheillas-projects-1b9c87b7.vercel.app',
      process.env.FRONTEND_URL,
    ].filter(Boolean);

    if (allowedOrigins.includes(origin)) {
      console.log('✅ CORS allowed for:', origin);
      return callback(null, true);
    }

    console.warn('❌ CORS blocked origin:', origin);
    callback(new Error('Not allowed by CORS policy'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Range'],
  exposedHeaders: ['Content-Range', 'Accept-Ranges', 'Content-Length'],
  optionsSuccessStatus: 204,
}));

app.use(express.json());

// 🔒 Initialize Supabase client — MUST use service role key in backend
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY
);

// Multer for in-memory audio uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/wav', 'audio/ogg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only audio files are allowed.'));
    }
  },
});

// Health check
app.get('/', (req, res) => {
  res.send('READit2 API is running successfully with Supabase Storage! 🎤');
});

// User registration
app.post('/api/register', async (req, res) => {
  const { email, password, name, school } = req.body;
  if (!email || !password || !name || !school) {
    return res.status(400).json({ error: 'All fields are required: email, password, name, school' });
  }

  try {
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const { data, error } = await supabase
      .from('users')
      .insert([{ email, password_hash: hashedPassword, name, school }])
      .select('id, email, name, school');

    if (error) throw error;

    console.log('✅ New user registered:', data[0].email);
    res.status(201).json({ message: 'Registration successful', user: data[0] });
  } catch (err) {
    console.error('❌ Registration error:', err);
    res.status(500).json({ error: 'Server error during registration.' });
  }
});

// User login - FIXED
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  // 🔍 DEBUG: Log raw incoming data
  console.log('🔍 Login attempt received:');
  console.log('  Email:', JSON.stringify(email));
  console.log('  Password:', JSON.stringify(password));

  if (!email || !password) {
    console.log('❌ Missing email or password');
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    // ✅ FIXED: Correctly destructure { data, error } from Supabase
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    // Check for Supabase errors
    if (error) {
      console.log('❌ Supabase error:', error.message);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (!user) {
      console.log('❌ No user found with email:', email);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    console.log('✅ User found. Comparing password...');
    const isMatch = await bcrypt.compare(password, user.password_hash);
    console.log('🔑 bcrypt.compare result:', isMatch);

    if (!isMatch) {
      console.log('❌ Password mismatch for user:', email);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const { password_hash, ...userData } = user;
    console.log('🎉 Login successful for:', userData.email);
    res.json({ message: 'Login successful', user: userData });

  } catch (err) {
    console.error('💥 Server error during login:', err);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
});

// Upload audio to Supabase Storage - FIXED
app.post('/api/upload-audio', upload.single('audio'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No audio file provided' });
  }

  try {
    const fileExt = req.file.originalname.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `reflections/${fileName}`;

    const { error } = await supabase.storage
      .from('audio-reflections')
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        cacheControl: '3600',
        upsert: false,
      });

    if (error) throw error;

    // ✅ FIXED: Correctly destructure { data } from Supabase
    const { data: urlData } = supabase.storage
      .from('audio-reflections')
      .getPublicUrl(filePath);

    console.log('✅ Audio uploaded:', fileName);
    res.json({
      message: 'Audio uploaded successfully',
      audioUrl: urlData.publicUrl,
      filename: fileName,
    });
  } catch (err) {
    console.error('❌ Audio upload error:', err);
    res.status(500).json({ error: 'Failed to upload audio.' });
  }
});

// Get all reflections
app.get('/api/reflections', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('reflections')
      .select(`*, users(name, school)`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error('❌ Fetch reflections error:', err);
    res.status(500).json({ error: 'Failed to fetch reflections.' });
  }
});

// Create a reflection
app.post('/api/reflections', async (req, res) => {
  const { user_id, book_title, reflection_text, audio_url } = req.body;
  if (!user_id || !book_title) {
    return res.status(400).json({ error: 'user_id and book_title are required' });
  }
  if (!reflection_text && !audio_url) {
    return res.status(400).json({ error: 'Either reflection_text or audio_url is required' });
  }

  try {
    const { data, error } = await supabase
      .from('reflections')
      .insert([{
        user_id,
        book_title,
        reflection_text: reflection_text || '',
        audio_url: audio_url || null,
      }])
      .select();

    if (error) throw error;
    console.log('✅ Reflection saved:', data[0].id);
    res.status(201).json(data[0]);
  } catch (err) {
    console.error('❌ Save reflection error:', err);
    res.status(500).json({ error: 'Failed to save reflection.' });
  }
});

// Get all recommendations
app.get('/api/recommendations', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('recommendations')
      .select(`*, users(name, school)`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error('❌ Fetch recommendations error:', err);
    res.status(500).json({ error: 'Failed to fetch recommendations.' });
  }
});

// Create a recommendation
app.post('/api/recommendations', async (req, res) => {
  const { user_id, book_title, author, genre, recommendation_text } = req.body;
  if (!user_id || !book_title || !recommendation_text) {
    return res.status(400).json({ error: 'user_id, book_title, and recommendation_text are required' });
  }

  try {
    const { data, error } = await supabase
      .from('recommendations')
      .insert([{ user_id, book_title, author, genre, recommendation_text }])
      .select();

    if (error) throw error;
    console.log('✅ Recommendation saved:', data[0].id);
    res.status(201).json(data[0]);
  } catch (err) {
    console.error('❌ Save recommendation error:', err);
    res.status(500).json({ error: 'Failed to save recommendation.' });
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

    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error('❌ Fetch badges error:', err);
    res.status(500).json({ error: 'Failed to fetch badges.' });
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

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('❌ Leaderboard error:', err);
    res.status(500).json({ error: 'Failed to fetch leaderboard.' });
  }
});

// Catch-all 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('💥 Global error:', err);
  res.status(500).json({ error: 'Unexpected server error' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🎤 READit2 Backend is running on port ${PORT}`);
  console.log('============================================');
  console.log('✅ Using SUPABASE_SERVICE_ROLE_KEY (with fallback)');
  console.log('✅ CORS configured for Vercel frontends');
  console.log('✅ Ready for secure production use!');
  console.log('============================================');
});