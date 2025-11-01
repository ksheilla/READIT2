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
  Grid
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import BadgeDisplay from '../components/BadgeDisplay';

function HomePage() {
  const [reflections, setReflections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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

  const fetchReflections = async () => {
    try {
      setError('');
      setLoading(true);
      
      const response = await fetch('http://localhost:5000/api/reflections');
      
      if (!response.ok) {
        throw new Error('Failed to fetch reflections');
      }
      
      const data = await response.json();
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
    
    // Set up interval to refresh reflections every 30 seconds
    const intervalId = setInterval(fetchReflections, 30000);
    
    return () => clearInterval(intervalId);
  }, []);

  if (!user) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
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
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        mb: 4
      }}>
        <Typography variant="h4" gutterBottom>
          Welcome, {user.name}!
        </Typography>
        <Typography variant="h6" color="textSecondary" gutterBottom>
          School: {user.school}
        </Typography>
        
        <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
          <Button 
            variant="contained" 
            onClick={handlePostReflection}
            size="large"
          >
            Post a Reflection
          </Button>
          <Button 
            variant="outlined" 
            onClick={handleViewLeaderboard}
            size="large"
          >
            Leaderboard
          </Button>
          <Button 
            variant="outlined" 
            onClick={handleLogout}
            size="large"
          >
            Logout
          </Button>
        </Box>
      </Box>
      
      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
        Recent Reading Activity
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
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="textSecondary">
            No reflections posted yet
          </Typography>
          <Typography color="textSecondary" sx={{ mt: 1 }}>
            Be the first to share your reading experience!
          </Typography>
          <Button 
            variant="contained" 
            onClick={handlePostReflection}
            sx={{ mt: 2 }}
          >
            Post Your First Reflection
          </Button>
        </Box>
      ) : (
        reflections.map(reflection => (
          <Card key={reflection.id} sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6">{reflection.book_title}</Typography>
              <Typography variant="body1" sx={{ mt: 1, mb: 2 }}>
                {reflection.reflection_text}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                By {reflection.users?.name} from {reflection.users?.school} • {new Date(reflection.created_at).toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        ))
      )}
      
      <BadgeDisplay userId={user.id} />
    </Container>
  );
}

export default HomePage;