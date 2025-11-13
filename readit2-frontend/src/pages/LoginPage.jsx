import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Box,
  Alert,
  Paper,
  InputAdornment,
  IconButton
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { Visibility, VisibilityOff, Email, Lock } from '@mui/icons-material';
import { login } from '../services/api';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [bookEmoji, setBookEmoji] = useState('📚');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const response = await login({ email, password });
      localStorage.setItem('readit2_user', JSON.stringify(response.user));
      
      // Celebration emoji change
      setBookEmoji('🎉');
      setTimeout(() => {
        navigate('/home');
      }, 500);
      
    } catch (err) {
      console.error('Login failed with error:', err);
      setError('Login failed. Please check your credentials.');
      setBookEmoji('😢');
      setTimeout(() => setBookEmoji('📚'), 2000);
    } finally {
      setLoading(false);
    }
  };

  const floatingBooks = [
    { emoji: '📚', top: '10%', left: '10%', delay: 0 },
    { emoji: '📖', top: '20%', right: '15%', delay: 0.5 },
    { emoji: '📕', bottom: '15%', left: '12%', delay: 1 },
    { emoji: '📗', bottom: '25%', right: '10%', delay: 1.5 },
    { emoji: '✨', top: '50%', left: '5%', delay: 0.3 },
    { emoji: '⭐', top: '60%', right: '8%', delay: 0.8 },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        position: 'relative',
        py: 4
      }}
    >
      {/* Floating Background Emojis */}
      {floatingBooks.map((book, index) => (
        <motion.div
          key={index}
          style={{
            position: 'absolute',
            fontSize: '3rem',
            opacity: 0.2,
            ...book
          }}
          animate={{
            y: [0, -20, 0],
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: 3 + book.delay,
            repeat: Infinity,
            ease: "easeInOut",
            delay: book.delay
          }}
        >
          {book.emoji}
        </motion.div>
      ))}

      <Container maxWidth="sm">
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ 
            type: "spring",
            stiffness: 100,
            damping: 15
          }}
        >
          <Paper
            elevation={12}
            sx={{
              borderRadius: 4,
              overflow: 'hidden',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <Box sx={{ p: 4 }}>
              {/* Animated Book Emoji */}
              <motion.div
                animate={{
                  rotate: [0, -10, 10, -10, 0],
                  scale: [1, 1.1, 1, 1.1, 1]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                style={{ textAlign: 'center', marginBottom: 16 }}
              >
                <Typography sx={{ fontSize: 80 }}>{bookEmoji}</Typography>
              </motion.div>

              {/* Title */}
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Typography 
                  variant="h3" 
                  sx={{ 
                    textAlign: 'center',
                    fontWeight: 'bold',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 1
                  }}
                >
                  READit2
                </Typography>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    textAlign: 'center',
                    color: 'text.secondary',
                    mb: 3
                  }}
                >
                  Let's start reading! 🚀
                </Typography>
              </motion.div>

              {/* Error Alert */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ type: "spring", stiffness: 200 }}
                  >
                    <Alert 
                      severity="error" 
                      sx={{ mb: 2, borderRadius: 2 }}
                      onClose={() => setError('')}
                    >
                      {error}
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Login Form */}
              <Box component="form" onSubmit={handleSubmit}>
                <motion.div
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <TextField
                    fullWidth
                    required
                    label="Email Address"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    sx={{ mb: 3 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email color="primary" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </motion.div>

                <motion.div
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <TextField
                    fullWidth
                    required
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    sx={{ mb: 3 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock color="primary" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </motion.div>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={loading}
                    sx={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      py: 1.5,
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                      boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                      '&:hover': {
                        boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)',
                      }
                    }}
                  >
                    {loading ? (
                      <motion.span
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        Signing in... ✨
                      </motion.span>
                    ) : (
                      'Sign In 🎉'
                    )}
                  </Button>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <Button
                    fullWidth
                    variant="text"
                    onClick={() => navigate('/register')}
                    sx={{ 
                      mt: 2,
                      color: '#667eea',
                      fontWeight: 'bold'
                    }}
                  >
                    Don't have an account? Join the adventure! 🚀
                  </Button>
                </motion.div>
              </Box>
            </Box>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
}

export default LoginPage;
