// ============================================================================
// Animated ReflectionPage.jsx with Emoji Reactions & Live Preview
// Replace your src/pages/ReflectionPage.jsx with this
// ============================================================================

import React, { useState } from 'react';
import { 
  Container, 
  TextField, 
  Button, 
  Box, 
  Typography,
  Alert,
  Paper,
  Card,
  CardContent,
  Chip,
  Avatar,
  ToggleButton,
  ToggleButtonGroup,
  Stepper,
  Step,
  StepLabel,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { 
  ArrowBack, 
  Send, 
  Preview,
  AutoStories,
  EmojiEmotions,
  Star,
  Favorite
} from '@mui/icons-material';

function ReflectionPage() {
  const [bookTitle, setBookTitle] = useState('');
  const [reflectionText, setReflectionText] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedMood, setSelectedMood] = useState('');
  const [activeStep, setActiveStep] = useState(0);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('readit2_user'));

  const moods = [
    { emoji: '😊', label: 'Happy', color: '#FFE66D' },
    { emoji: '😢', label: 'Sad', color: '#95E1D3' },
    { emoji: '😂', label: 'Funny', color: '#FF6B6B' },
    { emoji: '😮', label: 'Surprised', color: '#4ECDC4' },
    { emoji: '🤔', label: 'Thoughtful', color: '#AA96DA' },
    { emoji: '😍', label: 'Loved it', color: '#F38181' },
  ];

  const steps = ['📖 Choose Book', '✍️ Write Reflection', '👀 Preview & Post'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    if (!bookTitle.trim()) {
      setError('Book title is required');
      setLoading(false);
      return;
    }
    
    if (!reflectionText.trim()) {
      setError('Reflection text is required');
      setLoading(false);
      return;
    }
    
    try {
      await api.post('/reflections', {
        user_id: user.id,
        book_title: bookTitle,
        reflection_text: reflectionText + (selectedMood ? ` ${selectedMood}` : '')
      });
      
      // Success animation
      setActiveStep(3);
      
      setTimeout(() => {
        navigate('/home');
      }, 2000);
      
    } catch (err) {
      console.error('Error posting reflection:', err);
      setError('Failed to post reflection. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (activeStep === 0 && !bookTitle.trim()) {
      setError('Please enter a book title first!');
      return;
    }
    if (activeStep === 1 && !reflectionText.trim()) {
      setError('Please write your reflection first!');
      return;
    }
    setError('');
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
    setError('');
  };

  const getCharacterCount = () => {
    return reflectionText.length;
  };

  const getCharacterColor = () => {
    const count = getCharacterCount();
    if (count < 50) return '#FF6B6B';
    if (count < 200) return '#FFE66D';
    return '#4ECDC4';
  };

  const getEncouragementMessage = () => {
    const count = getCharacterCount();
    if (count === 0) return 'Start typing your thoughts... ✨';
    if (count < 50) return 'Keep going! Tell us more! 💪';
    if (count < 200) return 'Great! You\'re doing awesome! 🌟';
    if (count < 500) return 'Excellent reflection! 🎉';
    return 'Wow! That\'s a detailed reflection! 🏆';
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  const floatingEmojis = ['📚', '✏️', '💭', '⭐', '🎨', '💡'];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%)',
        py: 4,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Floating Background Emojis */}
      {floatingEmojis.map((emoji, index) => (
        <motion.div
          key={index}
          style={{
            position: 'absolute',
            fontSize: '2.5rem',
            opacity: 0.15,
            left: `${10 + index * 15}%`,
            top: `${20 + (index % 2) * 40}%`
          }}
          animate={{
            y: [0, -25, 0],
            rotate: [0, 360],
          }}
          transition={{
            duration: 4 + index,
            repeat: Infinity,
            ease: "easeInOut",
            delay: index * 0.5
          }}
        >
          {emoji}
        </motion.div>
      ))}

      <Container maxWidth="md">
        {/* Success Animation */}
        <AnimatePresence>
          {activeStep === 3 && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 9999
              }}
            >
              <Paper
                elevation={24}
                sx={{
                  p: 6,
                  borderRadius: 4,
                  textAlign: 'center',
                  background: 'linear-gradient(135deg, #FFE66D 0%, #FF6B6B 100%)'
                }}
              >
                <motion.div
                  animate={{
                    rotate: [0, 360],
                    scale: [1, 1.3, 1]
                  }}
                  transition={{ duration: 1, repeat: 3 }}
                >
                  <Typography sx={{ fontSize: 120 }}>🎉</Typography>
                </motion.div>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white', mt: 2 }}>
                  Reflection Posted! 🚀
                </Typography>
                <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)', mt: 1 }}>
                  Great job sharing your thoughts!
                </Typography>
              </Paper>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100 }}
        >
          <Paper
            elevation={12}
            sx={{
              borderRadius: 4,
              overflow: 'hidden',
              background: 'rgba(255, 255, 255, 0.98)',
              backdropFilter: 'blur(10px)'
            }}
          >
            {/* Header */}
            <Box
              sx={{
                background: 'linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%)',
                p: 3,
                color: 'white'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <IconButton 
                    onClick={() => navigate('/home')}
                    sx={{ color: 'white', mr: 2 }}
                  >
                    <ArrowBack />
                  </IconButton>
                </motion.div>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    Share Your Reading 📖
                  </Typography>
                  <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                    Tell us about your latest book adventure!
                  </Typography>
                </Box>
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
                  <Typography sx={{ fontSize: 60 }}>📚</Typography>
                </motion.div>
              </Box>

              {/* Stepper */}
              <Stepper activeStep={activeStep} sx={{ mt: 2 }}>
                {steps.map((label, index) => (
                  <Step key={label}>
                    <StepLabel
                      sx={{
                        '& .MuiStepLabel-label': {
                          color: 'white !important',
                          fontWeight: activeStep === index ? 'bold' : 'normal'
                        },
                        '& .MuiStepIcon-root': {
                          color: 'rgba(255,255,255,0.5)',
                          '&.Mui-active': {
                            color: 'white'
                          },
                          '&.Mui-completed': {
                            color: '#FFE66D'
                          }
                        }
                      }}
                    >
                      {label}
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Box>

            <Box sx={{ p: 4 }}>
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
                      sx={{ mb: 3, borderRadius: 2 }}
                      onClose={() => setError('')}
                    >
                      {error}
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>

              <Box component="form" onSubmit={handleSubmit}>
                {/* Step 1: Book Title */}
                <AnimatePresence mode="wait">
                  {activeStep === 0 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Box sx={{ mb: 4 }}>
                        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AutoStories color="primary" /> What book are you reading?
                        </Typography>
                        <TextField
                          fullWidth
                          label="Book Title"
                          value={bookTitle}
                          onChange={(e) => setBookTitle(e.target.value)}
                          placeholder="e.g., Harry Potter and the Sorcerer's Stone"
                          sx={{ mb: 2 }}
                          inputProps={{ maxLength: 100 }}
                          autoFocus
                        />
                        <Typography variant="caption" color="text.secondary">
                          {bookTitle.length}/100 characters
                        </Typography>

                        {/* Popular Books Suggestions */}
                        <Box sx={{ mt: 3 }}>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            💡 Popular choices:
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {['Harry Potter', 'Wonder', 'Matilda', 'Percy Jackson', 'Diary of a Wimpy Kid'].map((book) => (
                              <motion.div
                                key={book}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <Chip
                                  label={book}
                                  onClick={() => setBookTitle(book)}
                                  sx={{ cursor: 'pointer' }}
                                />
                              </motion.div>
                            ))}
                          </Box>
                        </Box>
                      </Box>
                    </motion.div>
                  )}

                  {/* Step 2: Write Reflection */}
                  {activeStep === 1 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Box sx={{ mb: 4 }}>
                        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <EmojiEmotions color="primary" /> What did you think?
                        </Typography>

                        <Card sx={{ mb: 2, bgcolor: '#F0F8FF', border: '2px solid #4ECDC4' }}>
                          <CardContent>
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                              📖 {bookTitle}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Share your thoughts, favorite moments, or what you learned!
                            </Typography>
                          </CardContent>
                        </Card>

                        <TextField
                          fullWidth
                          label="Your Reflection"
                          multiline
                          rows={8}
                          value={reflectionText}
                          onChange={(e) => setReflectionText(e.target.value)}
                          placeholder="I loved this book because... My favorite part was... This book taught me..."
                          sx={{ mb: 2 }}
                          inputProps={{ maxLength: 1000 }}
                        />

                        {/* Character Count with Animation */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <motion.div
                            animate={{
                              scale: getCharacterCount() > 0 ? [1, 1.1, 1] : 1
                            }}
                            transition={{ duration: 0.3 }}
                          >
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                color: getCharacterColor(),
                                fontWeight: 'bold',
                                fontSize: '1rem'
                              }}
                            >
                              {getCharacterCount()}/1000 characters
                            </Typography>
                          </motion.div>
                          <Typography variant="caption" sx={{ fontStyle: 'italic', color: getCharacterColor() }}>
                            {getEncouragementMessage()}
                          </Typography>
                        </Box>

                        {/* Mood Selection */}
                        <Box sx={{ mt: 3 }}>
                          <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                            😊 How did this book make you feel?
                          </Typography>
                          <ToggleButtonGroup
                            value={selectedMood}
                            exclusive
                            onChange={(e, newMood) => setSelectedMood(newMood)}
                            sx={{ 
                              display: 'flex', 
                              flexWrap: 'wrap',
                              gap: 1,
                              '& .MuiToggleButton-root': {
                                border: '2px solid #E0E0E0',
                                borderRadius: 2,
                                '&.Mui-selected': {
                                  borderColor: '#4ECDC4',
                                  bgcolor: '#E0F7F7'
                                }
                              }
                            }}
                          >
                            {moods.map((mood) => (
                              <motion.div key={mood.emoji} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                <ToggleButton value={mood.emoji}>
                                  <Box sx={{ textAlign: 'center' }}>
                                    <Typography sx={{ fontSize: 30 }}>{mood.emoji}</Typography>
                                    <Typography variant="caption">{mood.label}</Typography>
                                  </Box>
                                </ToggleButton>
                              </motion.div>
                            ))}
                          </ToggleButtonGroup>
                        </Box>
                      </Box>
                    </motion.div>
                  )}

                  {/* Step 3: Preview */}
                  {activeStep === 2 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Box sx={{ mb: 4 }}>
                        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Preview color="primary" /> Preview Your Reflection
                        </Typography>

                        {/* Preview Card */}
                        <motion.div
                          initial={{ scale: 0.95 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 200 }}
                        >
                          <Card 
                            sx={{ 
                              mb: 3,
                              border: '3px solid #4ECDC4',
                              boxShadow: '0 8px 32px rgba(78, 205, 196, 0.3)'
                            }}
                          >
                            <CardContent>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Avatar 
                                  sx={{ 
                                    bgcolor: '#4ECDC4',
                                    mr: 2,
                                    width: 50,
                                    height: 50,
                                    fontSize: '1.5rem'
                                  }}
                                >
                                  {user.name?.charAt(0)}
                                </Avatar>
                                <Box>
                                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                    {bookTitle} 📖
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    by {user.name} from {user.school}
                                  </Typography>
                                </Box>
                              </Box>
                              
                              <Divider sx={{ my: 2 }} />
                              
                              <Typography variant="body1" sx={{ lineHeight: 1.8, mb: 2 }}>
                                {reflectionText}
                              </Typography>

                              {selectedMood && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                                  <Typography sx={{ fontSize: 30 }}>{selectedMood}</Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    Mood: {moods.find(m => m.emoji === selectedMood)?.label}
                                  </Typography>
                                </Box>
                              )}
                              
                              <Box sx={{ display: 'flex', gap: 2, mt: 3, pt: 2, borderTop: '1px solid #E0E0E0' }}>
                                <Tooltip title="Others can like your reflection">
                                  <Chip icon={<Favorite />} label="0 Likes" size="small" />
                                </Tooltip>
                                <Chip label="Just now" size="small" />
                              </Box>
                            </CardContent>
                          </Card>
                        </motion.div>

                        <Alert severity="info" sx={{ borderRadius: 2 }}>
                          👀 This is how your reflection will appear to other readers!
                        </Alert>
                      </Box>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Navigation Buttons */}
                <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
                  {activeStep > 0 && activeStep < 3 && (
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        variant="outlined"
                        onClick={handleBack}
                        size="large"
                        sx={{ flex: 1 }}
                      >
                        ← Back
                      </Button>
                    </motion.div>
                  )}
                  
                  {activeStep < 2 ? (
                    <motion.div 
                      whileHover={{ scale: 1.05 }} 
                      whileTap={{ scale: 0.95 }}
                      style={{ flex: 1 }}
                    >
                      <Button
                        variant="contained"
                        onClick={handleNext}
                        size="large"
                        fullWidth
                        sx={{
                          background: 'linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%)',
                          fontWeight: 'bold',
                          fontSize: '1.1rem'
                        }}
                      >
                        Next →
                      </Button>
                    </motion.div>
                  ) : activeStep === 2 && (
                    <motion.div 
                      whileHover={{ scale: 1.05 }} 
                      whileTap={{ scale: 0.95 }}
                      style={{ flex: 1 }}
                    >
                      <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        fullWidth
                        disabled={loading}
                        startIcon={<Send />}
                        sx={{
                          background: 'linear-gradient(135deg, #FFE66D 0%, #FF6B6B 100%)',
                          fontWeight: 'bold',
                          fontSize: '1.1rem',
                          color: '#333'
                        }}
                      >
                        {loading ? 'Posting... ✨' : 'Post Reflection 🚀'}
                      </Button>
                    </motion.div>
                  )}
                </Box>
              </Box>
            </Box>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
}

export default ReflectionPage;