// src/pages/LeaderboardPage.jsx
import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Paper,
  Alert,
  CircularProgress,
  Button // This is the critical import you need
} from '@mui/material';

function LeaderboardPage() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const user = JSON.parse(localStorage.getItem('readit2_user'));

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setError('');
        setLoading(true);
        
        const response = await fetch('http://localhost:5000/api/leaderboard');
        
        if (!response.ok) {
          throw new Error('Failed to fetch leaderboard');
        }
        
        const data = await response.json();
        setLeaders(data);
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
        setError('Could not load leaderboard. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchLeaderboard();
  }, []);

  if (!user) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Box sx={{ textAlign: 'center', p: 4 }}>
          <Typography variant="h4" gutterBottom>
            Please log in to view the leaderboard
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Reading Leaderboard
        </Typography>
        <Typography variant="h6" color="textSecondary">
          Top readers in your school
        </Typography>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : leaders.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="textSecondary">
            No data available yet
          </Typography>
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Rank</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>School</TableCell>
                <TableCell>Streak</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {leaders.map((leader, index) => (
                <TableRow key={leader.id} sx={{ 
                  bgcolor: leader.id === user.id ? 'action.hover' : 'inherit'
                }}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{leader.name}</TableCell>
                  <TableCell>{leader.school}</TableCell>
                  <TableCell>{leader.current_streak} days</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      
      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Button 
          variant="outlined" 
          onClick={() => window.history.back()}
        >
          Back to Home
        </Button>
      </Box>
    </Container>
  );
}

export default LeaderboardPage;