import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Button, 
  Box, 
  Card, 
  CardContent, 
  Alert,
  CircularProgress,
  Grid,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  Paper
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import FavoriteIcon from '@mui/icons-material/Favorite';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import Mic from '@mui/icons-material/Mic';
import BadgeDisplay from '../components/BadgeDisplay';
import AudioPlayer from '../components/AudioPlayer';
import TextToSpeech from '../components/TextToSpeech';
import { api } from '../services/api';

// Popular books data
const POPULAR_BOOKS = [
  { id: 1, title: "Harry Potter and the Sorcerer's Stone", author: "J.K. Rowling", emoji: "⚡", color: "#FF6B6B" },
  { id: 2, title: "The Lion, the Witch and the Wardrobe", author: "C.S. Lewis", emoji: "🦁", color: "#4ECDC4" },
  { id: 3, title: "Charlotte's Web", author: "E.B. White", emoji: "🕷️", color: "#95E1D3" },
  { id: 4, title: "Matilda", author: "Roald Dahl", emoji: "📚", color: "#FFE66D" },
  { id: 5, title: "The Little Prince", author: "Antoine de Saint-Exupéry", emoji: "👑", color: "#F38181" },
  { id: 6, title: "Wonder", author: "R.J. Palacio", emoji: "⭐", color: "#AA96DA" },
  { id: 7, title: "Percy Jackson", author: "Rick Riordan", emoji: "🔱", color: "#5DADE2" },
  { id: 8, title: "Diary of a Wimpy Kid", author: "Jeff Kinney", emoji: "😂", color: "#FFB6C1" },
];

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100
    }
  }
};

const floatingAnimation = {
  y: [0, -10, 0],
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: "easeInOut"
  }
};

function HomePage() {
  const [reflections, setReflections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [likedReflections, setLikedReflections] = useState(new Set());
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('readit2_user'));
  
  const handleLogout = () => {
    localStorage.removeItem('readit2_user');
    navigate('/login');
  };

  const handlePostReflection = () => {
    navigate('/reflect');
  };

  const handleViewLeaderboard = () => {
    navigate('/leaderboard');
  };

  const handleViewRecommendations = () => {
    navigate('/recommendations');
  };

  const handleLike = (reflectionId) => {
    setLikedReflections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(reflectionId)) {
        newSet.delete(reflectionId);
      } else {
        newSet.add(reflectionId);
      }
      return newSet;
    });
  };

  const fetchReflections = async () => {
    try {
      setError('');
      setLoading(true);
      
      const data = await api.get('/reflections').then(res => res.data);
      setReflections(data);
    } catch (err) {
      console.error('Error fetching reflections:', err);
      setError('Could not load reflections. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReflections();
    const intervalId = setInterval(fetchReflections, 30000);
    return () => clearInterval(intervalId);
  }, []);

  if (!user) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            p: 4,
            borderRadius: 2,
            boxShadow: 3
          }}>
            <Typography variant="h4" gutterBottom>
              Please log in
            </Typography>
            <Button variant="contained" onClick={() => navigate('/login')}>
              Go to Login
            </Button>
          </Box>
        </motion.div>
      </Container>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      py: 4
    }}>
      <Container maxWidth="lg">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Welcome Header with Animation */}
          <motion.div variants={itemVariants}>
            <Paper
              elevation={8}
              sx={{
                background: 'linear-gradient(135deg, #FF6B6B 0%, #FFE66D 100%)',
                borderRadius: 4,
                p: 4,
                mb: 4,
                overflow: 'hidden',
                position: 'relative'
              }}
            >
              <motion.div
                animate={floatingAnimation}
                style={{
                  position: 'absolute',
                  right: 20,
                  top: 20,
                  fontSize: '80px'
                }}
              >
                📚
              </motion.div>
              
              <Typography 
                variant="h3" 
                sx={{ 
                  fontWeight: 'bold',
                  color: 'white',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
                  mb: 1
                }}
              >
                Welcome back, {user.name}! 🎉
              </Typography>
              <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)', mb: 3 }}>
                🏫 {user.school}
              </Typography>
              
              {/* Quick Stats */}
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Box sx={{ 
                      bgcolor: 'rgba(255,255,255,0.2)', 
                      borderRadius: 2, 
                      p: 2,
                      textAlign: 'center',
                      backdropFilter: 'blur(10px)'
                    }}>
                      <LocalFireDepartmentIcon sx={{ fontSize: 40, color: '#FF4757' }} />
                      <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                        {user.current_streak || 0}
                      </Typography>
                      <Typography sx={{ color: 'rgba(255,255,255,0.9)' }}>Day Streak</Typography>
                    </Box>
                  </motion.div>
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Box sx={{ 
                      bgcolor: 'rgba(255,255,255,0.2)', 
                      borderRadius: 2, 
                      p: 2,
                      textAlign: 'center',
                      backdropFilter: 'blur(10px)'
                    }}>
                      <MenuBookIcon sx={{ fontSize: 40, color: '#4ECDC4' }} />
                      <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                        {reflections.filter(r => r.user_id === user.id).length}
                      </Typography>
                      <Typography sx={{ color: 'rgba(255,255,255,0.9)' }}>Reflections</Typography>
                    </Box>
                  </motion.div>
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Box sx={{ 
                      bgcolor: 'rgba(255,255,255,0.2)', 
                      borderRadius: 2, 
                      p: 2,
                      textAlign: 'center',
                      backdropFilter: 'blur(10px)'
                    }}>
                      <EmojiEventsIcon sx={{ fontSize: 40, color: '#FFD700' }} />
                      <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                        3
                      </Typography>
                      <Typography sx={{ color: 'rgba(255,255,255,0.9)' }}>Badges</Typography>
                    </Box>
                  </motion.div>
                </Grid>
              </Grid>
            </Paper>
          </motion.div>

          {/* Action Buttons */}
          <motion.div variants={itemVariants}>
            <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="contained" 
                  size="large"
                  onClick={handlePostReflection}
                  startIcon={<MenuBookIcon />}
                  sx={{
                    background: 'linear-gradient(45deg, #FF6B6B 30%, #FF8E53 90%)',
                    boxShadow: '0 3px 15px rgba(255, 107, 107, 0.4)',
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem'
                  }}
                >
                  Post a Reflection
                </Button>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="contained"
                  size="large"
                  onClick={handleViewRecommendations}
                  startIcon={<AutoStoriesIcon />}
                  sx={{
                    background: 'linear-gradient(45deg, #FF8E53 30%, #FFE66D 90%)',
                    boxShadow: '0 3px 15px rgba(255, 142, 83, 0.4)',
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem'
                  }}
                >
                  Book Recommendations
                </Button>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="contained"
                  size="large"
                  onClick={handleViewLeaderboard}
                  startIcon={<EmojiEventsIcon />}
                  sx={{
                    background: 'linear-gradient(45deg, #4ECDC4 30%, #44A08D 90%)',
                    boxShadow: '0 3px 15px rgba(78, 205, 196, 0.4)',
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem'
                  }}
                >
                  Leaderboard
                </Button>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="outlined"
                  size="large"
                  onClick={handleLogout}
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    '&:hover': {
                      borderColor: 'white',
                      bgcolor: 'rgba(255,255,255,0.1)'
                    },
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem'
                  }}
                >
                  Logout
                </Button>
              </motion.div>
            </Box>
          </motion.div>

          {/* Popular Books Section */}
          <motion.div variants={itemVariants}>
            <Paper elevation={4} sx={{ borderRadius: 4, p: 3, mb: 4, bgcolor: 'rgba(255,255,255,0.95)' }}>
              <Typography 
                variant="h5" 
                gutterBottom 
                sx={{ 
                  fontWeight: 'bold',
                  color: '#667eea',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                📖 Popular Books to Read
              </Typography>
              
              <Grid container spacing={2} sx={{ mt: 1 }}>
                {POPULAR_BOOKS.map((book, index) => (
                  <Grid item xs={12} sm={6} md={3} key={book.id}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ 
                        scale: 1.05,
                        rotate: [0, -2, 2, 0],
                        transition: { duration: 0.3 }
                      }}
                    >
                      <Card 
                        sx={{ 
                          height: '100%',
                          cursor: 'pointer',
                          background: `linear-gradient(135deg, ${book.color}22 0%, ${book.color}44 100%)`,
                          border: `2px solid ${book.color}`,
                          transition: 'all 0.3s'
                        }}
                        onClick={() => {
                          navigate('/reflect');
                        }}
                      >
                        <CardContent>
                          <Box sx={{ textAlign: 'center', mb: 2 }}>
                            <Typography sx={{ fontSize: 50 }}>{book.emoji}</Typography>
                          </Box>
                          <Typography 
                            variant="subtitle1" 
                            sx={{ fontWeight: 'bold', mb: 0.5, textAlign: 'center' }}
                          >
                            {book.title}
                          </Typography>
                          <Typography 
                            variant="body2" 
                            color="text.secondary" 
                            sx={{ textAlign: 'center' }}
                          >
                            by {book.author}
                          </Typography>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </motion.div>
          
          {/* Recent Reading Activity */}
          <motion.div variants={itemVariants}>
            <Paper elevation={4} sx={{ borderRadius: 4, p: 3, bgcolor: 'rgba(255,255,255,0.95)' }}>
              <Typography 
                variant="h5" 
                gutterBottom 
                sx={{ 
                  fontWeight: 'bold',
                  color: '#667eea',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  mb: 3
                }}
              >
                🌟 Recent Reading Activity
              </Typography>
              
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : reflections.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <Box sx={{ textAlign: 'center', py: 6 }}>
                    <motion.div
                      animate={{ 
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <Typography sx={{ fontSize: 100, mb: 2 }}>📚</Typography>
                    </motion.div>
                    <Typography variant="h6" color="textSecondary" gutterBottom>
                      No reflections posted yet
                    </Typography>
                    <Typography color="textSecondary" sx={{ mb: 3 }}>
                      Be the first to share your reading experience!
                    </Typography>
                    <Button 
                      variant="contained" 
                      onClick={handlePostReflection}
                      size="large"
                      sx={{
                        background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                      }}
                    >
                      Post Your First Reflection
                    </Button>
                  </Box>
                </motion.div>
              ) : (
                <AnimatePresence>
                  {reflections.map((reflection, index) => (
                    <motion.div
                      key={reflection.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card 
                        sx={{ 
                          mb: 3,
                          borderRadius: 3,
                          overflow: 'hidden',
                          border: reflection.user_id === user.id ? '3px solid #667eea' : 'none',
                          boxShadow: reflection.user_id === user.id ? '0 4px 20px rgba(102, 126, 234, 0.3)' : undefined
                        }}
                      >
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Avatar 
                              sx={{ 
                                bgcolor: reflection.user_id === user.id ? '#667eea' : '#4ECDC4',
                                mr: 2,
                                width: 50,
                                height: 50,
                                fontSize: '1.5rem'
                              }}
                            >
                              {reflection.users?.name?.charAt(0) || '?'}
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                {reflection.book_title} 📖
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                by {reflection.users?.name} from {reflection.users?.school}
                              </Typography>
                            </Box>
                            {reflection.user_id === user.id && (
                              <Chip 
                                label="You" 
                                size="small" 
                                sx={{ 
                                  bgcolor: '#667eea',
                                  color: 'white',
                                  fontWeight: 'bold'
                                }}
                              />
                            )}
                            {reflection.audio_url && (
                              <Chip 
                                icon={<Mic />}
                                label="Audio" 
                                size="small" 
                                color="primary"
                                sx={{ ml: 1 }}
                              />
                            )}
                          </Box>
                          
                          {reflection.reflection_text && (
                            <>
                              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
                                {reflection.reflection_text}
                              </Typography>
                              
                              {/* TEXT-TO-SPEECH: Read the reflection aloud */}
                              <Box sx={{ mb: 2 }}>
                                <TextToSpeech text={reflection.reflection_text} compact={true} />
                              </Box>
                            </>
                          )}

                          {reflection.audio_url && (
                            <Box sx={{ mt: 2, mb: 2 }}>
                              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Mic /> Audio Reflection:
                              </Typography>
                              <AudioPlayer audioUrl={reflection.audio_url} compact={true} />
                            </Box>
                          )}
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Tooltip title="Like this reflection">
                              <motion.div whileTap={{ scale: 0.9 }}>
                                <IconButton 
                                  onClick={() => handleLike(reflection.id)}
                                  sx={{ 
                                    color: likedReflections.has(reflection.id) ? '#FF6B6B' : 'inherit'
                                  }}
                                >
                                  <FavoriteIcon />
                                </IconButton>
                              </motion.div>
                            </Tooltip>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(reflection.created_at).toLocaleDateString()} at {new Date(reflection.created_at).toLocaleTimeString()}
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </Paper>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <Paper elevation={4} sx={{ borderRadius: 4, p: 3, bgcolor: 'rgba(255,255,255,0.95)' }}>
              <BadgeDisplay userId={user.id} />
            </Paper>
          </motion.div>
        </motion.div>
      </Container>
    </Box>
  );
}

export default HomePage;