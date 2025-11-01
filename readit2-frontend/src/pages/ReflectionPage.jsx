import React, { useState } from 'react';
import { 
  Container, 
  TextField, 
  Button, 
  Box, 
  Typography,
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

function ReflectionPage() {
  const [bookTitle, setBookTitle] = useState('');
  const [reflectionText, setReflectionText] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('readit2_user'));

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
        reflection_text: reflectionText
      });
      
      // Clear form
      setBookTitle('');
      setReflectionText('');
      
      // Redirect to home
      navigate('/home');
      
    } catch (err) {
      console.error('Error posting reflection:', err);
      setError('Failed to post reflection. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Share Your Reading Experience
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <TextField
          fullWidth
          label="Book Title"
          value={bookTitle}
          onChange={(e) => setBookTitle(e.target.value)}
          required
          sx={{ mb: 3 }}
          inputProps={{ maxLength: 100 }}
        />
        
        <TextField
          fullWidth
          label="Your Reflection"
          multiline
          rows={6}
          value={reflectionText}
          onChange={(e) => setReflectionText(e.target.value)}
          required
          sx={{ mb: 3 }}
          inputProps={{ maxLength: 1000 }}
          helperText={`${reflectionText.length}/1000 characters`}
        />
        
        <Button 
          type="submit" 
          variant="contained"
          size="large"
          fullWidth
          disabled={loading}
        >
          {loading ? 'Posting...' : 'Post Reflection'}
        </Button>
      </Box>
      
      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Button 
          variant="outlined" 
          onClick={() => navigate('/home')}
        >
          Back to Home
        </Button>
      </Box>
    </Container>
  );
}

export default ReflectionPage;