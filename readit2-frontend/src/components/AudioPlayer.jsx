import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  Box, 
  Typography, 
  Button,
  LinearProgress
} from '@mui/material';
import { api } from '../services/api';

function AudioPlayer({ audio }) {
  const [audioUrl, setAudioUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (audio && audio.audio_url) {
      // For local development
      if (audio.audio_url.startsWith('/uploads')) {
        setAudioUrl(`http://localhost:5000${audio.audio_url}`);
      } else {
        setAudioUrl(audio.audio_url);
      }
      setLoading(false);
    }
  }, [audio]);

  if (loading) {
    return (
      <Card sx={{ mt: 2, mb: 2 }}>
        <CardContent>
          <LinearProgress />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card sx={{ mt: 2, mb: 2 }}>
        <CardContent>
          <Typography color="error">
            {error}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ mt: 2, mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Typography variant="h6">Audio Reflection</Typography>
        </Box>
        
        {audioUrl ? (
          <Box>
            <audio controls src={audioUrl} style={{ width: '100%', marginBottom: '10px' }} />
            <Typography variant="body2" color="textSecondary">
              By {audio.users?.name || 'User'} • {new Date(audio.created_at).toLocaleString()}
            </Typography>
          </Box>
        ) : (
          <Typography color="textSecondary">
            No audio available
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

export default AudioPlayer;