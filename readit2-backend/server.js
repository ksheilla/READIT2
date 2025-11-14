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

// Configure Helmet for security + allow audio
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginEmbedderPolicy: false,
}));

// ✅ Use global CORS middleware — handles OPTIONS automatically
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (e.g., mobile apps, curl)
    if (!origin) return callback(null, true);

    console.log('🌐 Request from origin:', origin);

    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://readit-2.vercel.app',
      'https://readit2-2.vercel.app', // ✅ Your actual frontend
      process.env.FRONTEND_URL,
    ].filter(Boolean); // Remove undefined/null

    if (allowedOrigins.includes(origin)) {
      console.log('✅ Allowed origin:', origin);
      return callback(null, true);
    }

    console.log('❌ Blocked by CORS:', origin);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Range'],
  exposedHeaders: ['Content-Range', 'Accept-Ranges', 'Content-Length'],
  optionsSuccessStatus: 204,
}));

app.use(express.json());

// Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY
);

// Multer for audio uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/wav', 'audio/ogg'];
    cb(null, allowedTypes.includes(file.mimetype));
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
    return res.status(400).json({ error: 'All fields are required: email, password, name, and school' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered.' });
    }

    const { data, error } = await supabase
      .from('users')
      .insert([{ email, password_hash: hashedPassword, name, school }])
      .select('id, email, name, school');

    if (error) throw error;

    console.log('New user registered:', data[0].email);
    res.status(201).json({ message: 'Registration successful', user: data[0] });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (!user) return res.status(401).json({ error: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(401).json({ error: 'Invalid email or password' });

    const { password_hash, ...userData } = user;
    console.log('User logged in:', userData.email);
    res.json({ message: 'Login successful', user: userData });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
});

// Upload audio
app.post('/api/upload-audio', upload.single('audio'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No audio file provided' });
  }

  try {
    const fileExt = req.file.originalname.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `reflections/${fileName}`;

    const { data, error } = await supabase.storage
      .from('audio-reflections')
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        cacheControl: '3600',
        upsert: false,
      });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from('audio-reflections')
      .getPublicUrl(filePath);

    console.log('Audio uploaded:', fileName);
    res.json({
      message: 'Audio uploaded successfully',
      audioUrl: urlData.publicUrl,
      filename: fileName,
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Failed to upload audio.' });
  }
});

// Get reflections
app.get('/api/reflections', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('reflections')
      .select(`*, users(name, school)`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error('Fetch reflections error:', err);
    res.status(500).json({ error: 'Failed to fetch reflections.' });
  }
});

// Create reflection
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
      .insert([{ user_id, book_title, reflection_text: reflection_text || '', audio_url: audio_url || null }])
      .select();

    if (error) throw error;
    console.log('Reflection saved:', data[0].id);
    res.status(201).json(data[0]);
  } catch (err) {
    console.error('Save reflection error:', err);
    res.status(500).json({ error: 'Failed to save reflection.' });
  }
});

// Get recommendations
app.get('/api/recommendations', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('recommendations')
      .select(`*, users(name, school)`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error('Fetch recommendations error:', err);
    res.status(500).json({ error: 'Failed to fetch recommendations.' });
  }
});

// Create recommendation
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
    res.status(201).json(data[0]);
  } catch (err) {
    console.error('Save recommendation error:', err);
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
    console.error('Fetch badges error:', err);
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
    console.error('Leaderboard error:', err);
    res.status(500).json({ error: 'Failed to fetch leaderboard.' });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Unexpected server error.' });
});

const PORT = process.env.PORT || 5000;

// Log startup info
let baseUrl = `http://localhost:${PORT}`;
if (process.env.RAILWAY_PUBLIC_DOMAIN) {
  baseUrl = `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`;
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🎤 READit2 Server running on port ${PORT}`);
  console.log('============================================');
  console.log(`API Base URL: ${baseUrl}/api`);
  console.log('Endpoints: /api/register, /api/login, etc.');
  console.log('============================================');
});