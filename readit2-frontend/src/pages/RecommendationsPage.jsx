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
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Avatar,
  IconButton,
  Tooltip,
  Paper
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShareIcon from '@mui/icons-material/Share';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import HomeIcon from '@mui/icons-material/Home';
import { api } from '../services/api';

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

// Genre colors
const GENRE_COLORS = {
  'Fiction': '#FF6B6B',
  'Non-fiction': '#4ECDC4',
  'Mystery': '#764ba2',
  'Romance': '#FF8E53',
  'Fantasy': '#AA96DA',
  'Adventure': '#5DADE2',
  'Science Fiction': '#95E1D3',
  'Biography': '#FFE66D',
  'default': '#667eea'
};

function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [likedRecommendations, setLikedRecommendations] = useState(new Set());
  const [formData, setFormData] = useState({
    book_title: '',
    author: '',
    genre: '',
    recommendation_text: ''
  });
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('readit2_user'));

  const fetchRecommendations = async () => {
    try {
      setError('');
      setLoading(true);
      
      const response = await api.get('/recommendations');
      setRecommendations(response.data);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError('Could not load recommendations. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
    
    const intervalId = setInterval(fetchRecommendations, 30000);
    return () => clearInterval(intervalId);
  }, []);

  const handleOpenDialog = () => {
    setOpenDialog(true);
    setSubmitError('');
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({
      book_title: '',
      author: '',
      genre: '',
      recommendation_text: ''
    });
    setSubmitError('');
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitting(true);
    
    if (!formData.book_title.trim()) {
      setSubmitError('Book title is required');
      setSubmitting(false);
      return;
    }
    
    if (!formData.recommendation_text.trim()) {
      setSubmitError('Recommendation text is required');
      setSubmitting(false);
      return;
    }
    
    try {
      await api.post('/recommendations', {
        user_id: user.id,
        ...formData
      });
      
      handleCloseDialog();
      fetchRecommendations();
      
    } catch (err) {
      console.error('Error posting recommendation:', err);
      setSubmitError('Failed to post recommendation. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = (recId) => {
    setLikedRecommendations(prev => {
      const newSet = new Set(prev);
      if (newSet.has(recId)) {
        newSet.delete(recId);
      } else {
        newSet.add(recId);
      }
      return newSet;
    });
  };

  if (!user) {
    navigate('/login');
    return null;
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
          {/* Header with Animation */}
          <motion.div variants={itemVariants}>
            <Paper
              elevation={8}
              sx={{
                background: 'linear-gradient(135deg, #FF8E53 0%, #FFE66D 100%)',
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
                Book Recommendations 🌟
              </Typography>
              <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)', mb: 3 }}>
                Discover amazing books recommended by your friends!
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    variant="contained" 
                    size="large"
                    onClick={handleOpenDialog}
                    startIcon={<ShareIcon />}
                    sx={{
                      background: 'linear-gradient(45deg, #FF6B6B 30%, #FF8E53 90%)',
                      boxShadow: '0 3px 15px rgba(255, 107, 107, 0.4)',
                      color: 'white',
                      px: 4,
                      py: 1.5,
                      fontSize: '1.1rem'
                    }}
                  >
                    Recommend a Book
                  </Button>
                </motion.div>
                
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    variant="outlined"
                    size="large"
                    onClick={() => navigate('/home')}
                    startIcon={<HomeIcon />}
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
                    Back to Home
                  </Button>
                </motion.div>
              </Box>
            </Paper>
          </motion.div>
          
          {error && (
            <motion.div variants={itemVariants}>
              <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                {error}
              </Alert>
            </motion.div>
          )}
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress size={60} sx={{ color: 'white' }} />
            </Box>
          ) : recommendations.length === 0 ? (
            <motion.div variants={itemVariants}>
              <Paper elevation={4} sx={{ borderRadius: 4, p: 6, textAlign: 'center', bgcolor: 'rgba(255,255,255,0.95)' }}>
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
                  <Typography sx={{ fontSize: 120, mb: 2 }}>📖</Typography>
                </motion.div>
                <Typography variant="h5" color="textSecondary" gutterBottom fontWeight="bold">
                  No recommendations yet
                </Typography>
                <Typography color="textSecondary" sx={{ mb: 3, fontSize: '1.1rem' }}>
                  Be the first to recommend an amazing book to your friends!
                </Typography>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    variant="contained" 
                    onClick={handleOpenDialog}
                    size="large"
                    startIcon={<ShareIcon />}
                    sx={{
                      background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                      px: 4,
                      py: 2,
                      fontSize: '1.1rem'
                    }}
                  >
                    Recommend Your First Book
                  </Button>
                </motion.div>
              </Paper>
            </motion.div>
          ) : (
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
                ✨ Recommended Books ({recommendations.length})
              </Typography>
              
              <Grid container spacing={3}>
                <AnimatePresence>
                  {recommendations.map((rec, index) => (
                    <Grid item xs={12} key={rec.id}>
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                      >
                        <Card 
                          sx={{ 
                            borderRadius: 3,
                            overflow: 'hidden',
                            border: rec.user_id === user.id ? '3px solid #667eea' : 'none',
                            boxShadow: rec.user_id === user.id ? '0 4px 20px rgba(102, 126, 234, 0.3)' : '0 2px 10px rgba(0,0,0,0.1)',
                            transition: 'all 0.3s',
                            '&:hover': {
                              boxShadow: '0 6px 25px rgba(102, 126, 234, 0.4)'
                            }
                          }}
                        >
                          <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'start', mb: 2 }}>
                              <Avatar 
                                sx={{ 
                                  bgcolor: GENRE_COLORS[rec.genre] || GENRE_COLORS.default,
                                  mr: 2,
                                  width: 60,
                                  height: 60,
                                  fontSize: '2rem'
                                }}
                              >
                                📚
                              </Avatar>
                              
                              <Box sx={{ flex: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                  <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#667eea' }}>
                                    {rec.book_title}
                                  </Typography>
                                  {rec.user_id === user.id && (
                                    <Chip 
                                      label="Your Pick!" 
                                      size="small" 
                                      sx={{ 
                                        bgcolor: '#667eea',
                                        color: 'white',
                                        fontWeight: 'bold'
                                      }}
                                    />
                                  )}
                                </Box>
                                
                                {rec.author && (
                                  <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 1 }}>
                                    ✍️ by {rec.author}
                                  </Typography>
                                )}
                                
                                {rec.genre && (
                                  <Chip 
                                    label={rec.genre} 
                                    size="small"
                                    sx={{ 
                                      bgcolor: GENRE_COLORS[rec.genre] || GENRE_COLORS.default,
                                      color: 'white',
                                      fontWeight: 'bold',
                                      mb: 2
                                    }}
                                  />
                                )}
                              </Box>
                            </Box>
                            
                            <Box 
                              sx={{ 
                                bgcolor: 'rgba(102, 126, 234, 0.05)',
                                borderRadius: 2,
                                p: 2,
                                mb: 2,
                                borderLeft: '4px solid #667eea'
                              }}
                            >
                              <Typography variant="body1" sx={{ lineHeight: 1.7, fontSize: '1.05rem' }}>
                                💭 {rec.recommendation_text}
                              </Typography>
                            </Box>
                            
                            <Box sx={{ 
                              display: 'flex', 
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              pt: 2,
                              borderTop: '1px solid',
                              borderColor: 'divider'
                            }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Avatar 
                                    sx={{ 
                                      bgcolor: rec.user_id === user.id ? '#667eea' : '#4ECDC4',
                                      width: 35,
                                      height: 35,
                                      fontSize: '1rem',
                                      mr: 1
                                    }}
                                  >
                                    {rec.users?.name?.charAt(0) || '?'}
                                  </Avatar>
                                  <Box>
                                    <Typography variant="body2" fontWeight="bold">
                                      {rec.users?.name}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {rec.users?.school}
                                    </Typography>
                                  </Box>
                                </Box>
                                
                                <Tooltip title="Like this recommendation">
                                  <motion.div whileTap={{ scale: 0.9 }}>
                                    <IconButton 
                                      onClick={() => handleLike(rec.id)}
                                      sx={{ 
                                        color: likedRecommendations.has(rec.id) ? '#FF6B6B' : 'inherit'
                                      }}
                                    >
                                      <ThumbUpIcon />
                                    </IconButton>
                                  </motion.div>
                                </Tooltip>
                              </Box>
                              
                              <Typography variant="caption" color="text.secondary">
                                {new Date(rec.created_at).toLocaleDateString()}
                              </Typography>
                            </Box>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </Grid>
                  ))}
                </AnimatePresence>
              </Grid>
            </Paper>
          )}
        </motion.div>
      </Container>

      {/* Recommendation Dialog with Animation */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          fontSize: '1.5rem',
          fontWeight: 'bold'
        }}>
          📚 Recommend a Book
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {submitError && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              {submitError}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              required
              label="Book Title"
              name="book_title"
              value={formData.book_title}
              onChange={handleChange}
              sx={{ mb: 2 }}
              inputProps={{ maxLength: 200 }}
              placeholder="e.g., Harry Potter and the Sorcerer's Stone"
            />
            
            <TextField
              fullWidth
              label="Author"
              name="author"
              value={formData.author}
              onChange={handleChange}
              sx={{ mb: 2 }}
              inputProps={{ maxLength: 200 }}
              placeholder="e.g., J.K. Rowling"
            />
            
            <TextField
              fullWidth
              label="Genre"
              name="genre"
              value={formData.genre}
              onChange={handleChange}
              sx={{ mb: 2 }}
              placeholder="e.g., Fiction, Mystery, Adventure"
              inputProps={{ maxLength: 100 }}
            />
            
            <TextField
              fullWidth
              required
              label="Why do you recommend this book?"
              name="recommendation_text"
              multiline
              rows={4}
              value={formData.recommendation_text}
              onChange={handleChange}
              inputProps={{ maxLength: 1000 }}
              helperText={`${formData.recommendation_text.length}/1000 characters`}
              placeholder="Tell your friends why they should read this amazing book!"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button onClick={handleCloseDialog} size="large">
            Cancel
          </Button>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              onClick={handleSubmit}
              variant="contained"
              disabled={submitting}
              size="large"
              sx={{
                background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                px: 4
              }}
            >
              {submitting ? 'Posting...' : '✨ Post Recommendation'}
            </Button>
          </motion.div>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default RecommendationsPage;