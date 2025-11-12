import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Box,
  Alert,
  Grid,
  Paper,
  InputAdornment,
  IconButton,
  LinearProgress,
  Chip
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Visibility, 
  VisibilityOff, 
  Email, 
  Lock,
  Person,
  School
} from '@mui/icons-material';
import { register } from '../services/api';
import { useNavigate } from 'react-router-dom';

function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    school: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1); // Form step for animation
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }
    
    try {
      await register(formData);
      
      // Show success and redirect
      setStep(3);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateStrength = () => {
    if (!formData.password) return 0;
    let strength = 0;
    if (formData.password.length >= 6) strength += 25;
    if (formData.password.length >= 8) strength += 25;
    if (/[A-Z]/.test(formData.password)) strength += 25;
    if (/[0-9]/.test(formData.password)) strength += 25;
    return strength;
  };

  const passwordStrength = calculateStrength();
  const getStrengthColor = () => {
    if (passwordStrength < 50) return 'error';
    if (passwordStrength < 75) return 'warning';
    return 'success';
  };

  const confettiEmojis = ['🎉', '🎊', '⭐', '✨', '🌟', '💫', '🎈', '🎆'];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #FF6B6B 0%, #FFE66D 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        position: 'relative',
        py: 4
      }}
    >
      {/* Floating Background Elements */}
      {[...Array(8)].map((_, index) => (
        <motion.div
          key={index}
          style={{
            position: 'absolute',
            fontSize: '2rem',
            opacity: 0.3,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 20 - 10, 0],
            rotate: [0, 360],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 2
          }}
        >
          {['📚', '📖', '✏️', '🎨', '🌈', '🚀', '💡', '🎭'][index]}
        </motion.div>
      ))}

      <Container maxWidth="md">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100 }}
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
              {/* Success Step */}
              <AnimatePresence>
                {step === 3 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    style={{ textAlign: 'center' }}
                  >
                    <motion.div
                      animate={{
                        rotate: [0, 360],
                        scale: [1, 1.2, 1]
                      }}
                      transition={{ duration: 1, repeat: 2 }}
                    >
                      <Typography sx={{ fontSize: 100 }}>🎉</Typography>
                    </motion.div>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#4ECDC4', mb: 2 }}>
                      Welcome to READit2! 🚀
                    </Typography>
                    <Typography variant="h6" color="text.secondary">
                      Redirecting you to login...
                    </Typography>
                    
                    {/* Confetti Effect */}
                    {confettiEmojis.map((emoji, i) => (
                      <motion.div
                        key={i}
                        style={{
                          position: 'absolute',
                          fontSize: '2rem',
                          left: '50%',
                          top: '50%'
                        }}
                        animate={{
                          x: [0, (Math.random() - 0.5) * 400],
                          y: [0, (Math.random() - 0.5) * 400],
                          rotate: [0, Math.random() * 720],
                          opacity: [1, 0]
                        }}
                        transition={{
                          duration: 2,
                          ease: "easeOut",
                          delay: i * 0.1
                        }}
                      >
                        {emoji}
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {step !== 3 && (
                <>
                  {/* Animated Header */}
                  <motion.div
                    animate={{
                      scale: [1, 1.05, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    style={{ textAlign: 'center', marginBottom: 16 }}
                  >
                    <Typography sx={{ fontSize: 80 }}>🎨</Typography>
                  </motion.div>

                  <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                  >
                    <Typography 
                      variant="h3" 
                      sx={{ 
                        textAlign: 'center',
                        fontWeight: 'bold',
                        background: 'linear-gradient(135deg, #FF6B6B 0%, #FFE66D 100%)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        mb: 1
                      }}
                    >
                      Join READit2! 
                    </Typography>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        textAlign: 'center',
                        color: 'text.secondary',
                        mb: 3
                      }}
                    >
                      Start your reading adventure today! 📚✨
                    </Typography>
                  </motion.div>

                  {/* Progress Chips */}
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 3 }}>
                    {['Personal', 'School', 'Security'].map((label, index) => (
                      <Chip
                        key={label}
                        label={label}
                        size="small"
                        color={step > index ? 'primary' : 'default'}
                        icon={<span>{['👤', '🏫', '🔒'][index]}</span>}
                      />
                    ))}
                  </Box>

                  {/* Error Alert */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
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

                  {/* Registration Form */}
                  <Box component="form" onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <motion.div
                          initial={{ x: -50, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.1 }}
                        >
                          <TextField
                            required
                            fullWidth
                            label="Full Name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Person color="primary" />
                                </InputAdornment>
                              ),
                            }}
                          />
                        </motion.div>
                      </Grid>
                      
                      <Grid item xs={12}>
                        <motion.div
                          initial={{ x: -50, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.2 }}
                        >
                          <TextField
                            required
                            fullWidth
                            label="Email Address"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Email color="primary" />
                                </InputAdornment>
                              ),
                            }}
                          />
                        </motion.div>
                      </Grid>
                      
                      <Grid item xs={12}>
                        <motion.div
                          initial={{ x: -50, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.3 }}
                        >
                          <TextField
                            required
                            fullWidth
                            label="School Name"
                            name="school"
                            value={formData.school}
                            onChange={handleChange}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <School color="primary" />
                                </InputAdornment>
                              ),
                            }}
                          />
                        </motion.div>
                      </Grid>
                      
                      <Grid item xs={12}>
                        <motion.div
                          initial={{ x: -50, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.4 }}
                        >
                          <TextField
                            required
                            fullWidth
                            label="Password"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            value={formData.password}
                            onChange={handleChange}
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
                          {formData.password && (
                            <Box sx={{ mt: 1 }}>
                              <LinearProgress 
                                variant="determinate" 
                                value={passwordStrength}
                                color={getStrengthColor()}
                                sx={{ height: 6, borderRadius: 3 }}
                              />
                              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                Password strength: {passwordStrength < 50 ? 'Weak' : passwordStrength < 75 ? 'Medium' : 'Strong'} {passwordStrength >= 75 ? '💪' : ''}
                              </Typography>
                            </Box>
                          )}
                        </motion.div>
                      </Grid>
                    </Grid>

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
                          mt: 3,
                          background: 'linear-gradient(135deg, #FF6B6B 0%, #FFE66D 100%)',
                          py: 1.5,
                          fontSize: '1.1rem',
                          fontWeight: 'bold',
                          boxShadow: '0 4px 15px rgba(255, 107, 107, 0.4)',
                          '&:hover': {
                            boxShadow: '0 6px 20px rgba(255, 107, 107, 0.6)',
                          }
                        }}
                      >
                        {loading ? (
                          <motion.span
                            animate={{ opacity: [1, 0.5, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                          >
                            Creating your account... ✨
                          </motion.span>
                        ) : (
                          'Create Account 🚀'
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
                        onClick={() => navigate('/login')}
                        sx={{ 
                          mt: 2,
                          color: '#FF6B6B',
                          fontWeight: 'bold'
                        }}
                      >
                        Already have an account? Sign in here! 👋
                      </Button>
                    </motion.div>
                  </Box>
                </>
              )}
            </Box>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
}

export default RegisterPage;