import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Grid } from '@mui/material';

function BadgeDisplay({ userId }) {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/badges/${userId}`);
        const data = await response.json();
        setBadges(data);
      } catch (err) {
        console.error('Error fetching badges:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBadges();
  }, [userId]);

  if (loading) return null;

  if (badges.length === 0) {
    return (
      <Box sx={{ p: 2, mt: 2, textAlign: 'center' }}>
        <Typography color="textSecondary">
          No badges yet - keep reading to earn them!
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Your Badges
      </Typography>
      <Grid container spacing={2}>
        {badges.map(badge => (
          <Grid item xs={12} sm={6} md={4} key={badge.id}>
            <Card sx={{ textAlign: 'center', p: 2 }}>
              <Box sx={{ 
                width: 60, 
                height: 60, 
                borderRadius: '50%', 
                bgcolor: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 1
              }}>
                🏆
              </Box>
              <Typography fontWeight="bold">{badge.badge_name}</Typography>
              <Typography variant="caption">{badge.description}</Typography>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default BadgeDisplay;