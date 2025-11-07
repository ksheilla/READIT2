const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');
const helmet = require('helmet');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

app.get('/', (req, res) => {
  res.send('READit2 API is running successfully!');
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

// Create a new reflection
app.post('/api/reflections', async (req, res) => {
  const { user_id, book_title, reflection_text } = req.body;
  
  if (!user_id || !book_title || !reflection_text) {
    return res.status(400).json({ 
      error: 'All fields are required: user_id, book_title, and reflection_text' 
    });
  }
  
  try {
    const { data, error } = await supabase
      .from('reflections')
      .insert([
        { 
          user_id, 
          book_title, 
          reflection_text 
        }
      ])
      .select();
      
    if (error) {
      console.error('Database error saving reflection:', error);
      return res.status(500).json({ 
        error: 'Failed to save reflection. Please try again later.' 
      });
    }
    
    console.log('Reflection saved successfully:', data[0].id);
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
app.listen(PORT, () => {
  console.log(`\nREADit2 Server is running on port ${PORT}`);
  console.log('===================================================');
  console.log('API Base URL: http://localhost:5000/api');
  console.log('Available endpoints:');
  console.log('  - POST /api/register');
  console.log('  - POST /api/login');
  console.log('  - GET /api/reflections');
  console.log('  - POST /api/reflections');
  console.log('  - GET /api/recommendations');
  console.log('  - POST /api/recommendations');
  console.log('  - GET /api/badges/:userId');
  console.log('  - GET /api/leaderboard');
  console.log('===================================================');
  console.log('Connect your frontend to: http://localhost:3000');
});