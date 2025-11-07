import React, { useState, useRef } from 'react';
import { 
  Button, 
  Box, 
  Typography, 
  LinearProgress,
  Card,
  CardContent
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

function AudioRecorder({ reflectionId, onAudioRecorded }) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('readit2_user'));

  // Initialize audio recording
  const startRecording = async () => {
    try {
      setError('');
      setIsRecording(true);
      setRecordingTime(0);
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/wav' });
        setAudioBlob(blob);
        chunksRef.current = [];
      };
      
      mediaRecorderRef.current.start();
      
      // Start the timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setError('Could not access microphone. Please check your permissions.');
      setIsRecording(false);
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      clearInterval(timerRef.current);
      setIsRecording(false);
    }
  };

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Upload the recorded audio
  const handleUpload = async () => {
    if (!audioBlob || !reflectionId) {
      setError('No audio to upload');
      return;
    }
    
    try {
      setIsUploading(true);
      setError('');
      
      const formData = new FormData();
      formData.append('audio', audioBlob, `reflection-${reflectionId}.wav`);
      formData.append('reflection_id', reflectionId);
      
      const response = await api.post('/audio/reflections', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.audio) {
        if (onAudioRecorded) {
          onAudioRecorded(response.data.audio);
        }
        // Clear the recording
        setAudioBlob(null);
        setRecordingTime(0);
      }
    } catch (err) {
      console.error('Error uploading audio:', err);
      setError('Failed to upload audio. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <Card sx={{ mt: 2, mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Typography variant="h6">Record Your Reflection</Typography>
          {isRecording && (
            <Box sx={{ ml: 2, display: 'flex', alignItems: 'center' }}>
              <Box sx={{ 
                width: 10, 
                height: 10, 
                borderRadius: '50%', 
                bgcolor: 'error.main',
                mr: 1,
                animation: 'pulse 1.5s infinite'
              }} />
              <Typography variant="body2" color="error">
                {formatTime(recordingTime)}
              </Typography>
            </Box>
          )}
        </Box>
        
        {error && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="error">
              {error}
            </Typography>
          </Box>
        )}
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          {!isRecording ? (
            <Button 
              variant="contained" 
              onClick={startRecording}
              disabled={isUploading}
              sx={{ 
                backgroundColor: 'primary.main',
                '&:hover': {
                  backgroundColor: 'primary.dark'
                }
              }}
            >
              Start Recording
            </Button>
          ) : (
            <Button 
              variant="contained" 
              onClick={stopRecording}
              color="error"
              sx={{ 
                backgroundColor: 'error.main',
                '&:hover': {
                  backgroundColor: 'error.dark'
                }
              }}
            >
              Stop Recording
            </Button>
          )}
          
          {audioBlob && (
            <Button 
              variant="outlined" 
              onClick={handleUpload}
              disabled={isUploading}
              sx={{ 
                borderColor: 'primary.main',
                color: 'primary.main',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  borderColor: 'primary.dark'
                }
              }}
            >
              {isUploading ? 'Uploading...' : 'Upload'}
            </Button>
          )}
        </Box>
        
        {isUploading && (
          <Box sx={{ mt: 2 }}>
            <LinearProgress />
          </Box>
        )}
        
        {audioBlob && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Recorded Audio:
            </Typography>
            <audio controls src={URL.createObjectURL(audioBlob)} style={{ width: '100%' }} />
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

export default AudioRecorder;