import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  IconButton,
  Card,
  CardContent,
  Alert,
  LinearProgress,
  Chip
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  Stop,
  PlayArrow,
  Pause,
  Delete,
  CheckCircle
} from '@mui/icons-material';

const AudioRecorder = ({ onAudioRecorded, existingAudioUrl = null }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioUrl, setAudioUrl] = useState(existingAudioUrl);
  const [audioBlob, setAudioBlob] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState('');
  const [hasPermission, setHasPermission] = useState(null);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const audioPlayerRef = useRef(null);
  const streamRef = useRef(null);

  // Request microphone permission on mount
  useEffect(() => {
    checkMicrophonePermission();
    return () => {
      // Cleanup
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const checkMicrophonePermission = async () => {
    try {
      const result = await navigator.permissions.query({ name: 'microphone' });
      setHasPermission(result.state === 'granted');
      
      result.addEventListener('change', () => {
        setHasPermission(result.state === 'granted');
      });
    } catch (err) {
      console.log('Permission API not supported, will request on first use');
      setHasPermission(null);
    }
  };

  const startRecording = async () => {
    setError('');
    audioChunksRef.current = [];
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      
      streamRef.current = stream;
      setHasPermission(true);
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') 
          ? 'audio/webm' 
          : 'audio/mp4'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { 
          type: mediaRecorder.mimeType 
        });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        setAudioBlob(audioBlob);
        
        // Notify parent component
        if (onAudioRecorded) {
          onAudioRecorded(audioBlob, url);
        }
        
        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
      };
      
      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 300) { // Max 5 minutes
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
      
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setError('Could not access microphone. Please check permissions.');
      setHasPermission(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        
        timerRef.current = setInterval(() => {
          setRecordingTime(prev => {
            if (prev >= 300) {
              stopRecording();
              return prev;
            }
            return prev + 1;
          });
        }, 1000);
      } else {
        mediaRecorderRef.current.pause();
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      }
      setIsPaused(!isPaused);
    }
  };

  const playAudio = () => {
    if (audioPlayerRef.current) {
      if (isPlaying) {
        audioPlayerRef.current.pause();
        setIsPlaying(false);
      } else {
        audioPlayerRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const deleteRecording = () => {
    setAudioUrl(null);
    setAudioBlob(null);
    setRecordingTime(0);
    setIsPlaying(false);
    if (onAudioRecorded) {
      onAudioRecorded(null, null);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Box sx={{ width: '100%' }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {hasPermission === false && (
        <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
          Microphone access denied. Please enable it in your browser settings to record audio.
        </Alert>
      )}

      <Card 
        sx={{ 
          borderRadius: 3,
          background: isRecording 
            ? 'linear-gradient(135deg, #FF6B6B 0%, #FFE66D 100%)'
            : 'linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%)',
          border: '3px solid',
          borderColor: isRecording ? '#FF6B6B' : '#4ECDC4',
          boxShadow: isRecording ? '0 0 30px rgba(255, 107, 107, 0.5)' : '0 4px 20px rgba(0,0,0,0.1)'
        }}
      >
        <CardContent>
          <Box sx={{ textAlign: 'center' }}>
            {/* Recording Status */}
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 'bold', 
                color: 'white',
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1
              }}
            >
              🎤 {isRecording ? 'Recording...' : audioUrl ? 'Recording Ready!' : 'Record Your Thoughts'}
            </Typography>

            {/* Recording Controls */}
            {!audioUrl && (
              <Box sx={{ mb: 2 }}>
                {!isRecording ? (
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <IconButton
                      onClick={startRecording}
                      sx={{
                        width: 100,
                        height: 100,
                        bgcolor: 'white',
                        color: '#FF6B6B',
                        '&:hover': {
                          bgcolor: 'rgba(255,255,255,0.9)',
                          transform: 'scale(1.1)'
                        },
                        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                        transition: 'all 0.3s'
                      }}
                    >
                      <Mic sx={{ fontSize: 50 }} />
                    </IconButton>
                  </motion.div>
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                    <motion.div
                      animate={{
                        scale: [1, 1.2, 1],
                        boxShadow: [
                          '0 0 0 0 rgba(255,255,255,0.7)',
                          '0 0 0 20px rgba(255,255,255,0)',
                          '0 0 0 0 rgba(255,255,255,0)'
                        ]
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <IconButton
                        onClick={pauseRecording}
                        sx={{
                          width: 80,
                          height: 80,
                          bgcolor: 'white',
                          color: '#FFE66D',
                          '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' }
                        }}
                      >
                        {isPaused ? <PlayArrow sx={{ fontSize: 40 }} /> : <Pause sx={{ fontSize: 40 }} />}
                      </IconButton>
                    </motion.div>
                    
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <IconButton
                        onClick={stopRecording}
                        sx={{
                          width: 80,
                          height: 80,
                          bgcolor: 'white',
                          color: '#FF6B6B',
                          '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' }
                        }}
                      >
                        <Stop sx={{ fontSize: 40 }} />
                      </IconButton>
                    </motion.div>
                  </Box>
                )}

                {/* Timer and Progress */}
                {isRecording && (
                  <Box sx={{ mt: 3 }}>
                    <Typography 
                      variant="h4" 
                      sx={{ 
                        fontWeight: 'bold', 
                        color: 'white',
                        mb: 1,
                        fontFamily: 'monospace'
                      }}
                    >
                      {formatTime(recordingTime)}
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={(recordingTime / 300) * 100}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: 'rgba(255,255,255,0.3)',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: 'white'
                        }
                      }}
                    />
                    <Typography variant="caption" sx={{ color: 'white', mt: 1, display: 'block' }}>
                      {isPaused ? '⏸️ Paused' : '🔴 Recording'} • Max 5 minutes
                    </Typography>
                  </Box>
                )}
              </Box>
            )}

            {/* Audio Playback */}
            {audioUrl && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <Box sx={{ 
                  bgcolor: 'rgba(255,255,255,0.9)', 
                  borderRadius: 3, 
                  p: 3,
                  mb: 2
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                    <CheckCircle sx={{ color: '#4ECDC4', fontSize: 40, mr: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333' }}>
                      Recording Complete!
                    </Typography>
                  </Box>

                  <Chip 
                    label={`Duration: ${formatTime(recordingTime)}`}
                    sx={{ mb: 2, fontWeight: 'bold' }}
                  />

                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 2 }}>
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <IconButton
                        onClick={playAudio}
                        sx={{
                          width: 60,
                          height: 60,
                          bgcolor: '#4ECDC4',
                          color: 'white',
                          '&:hover': { bgcolor: '#44A08D' }
                        }}
                      >
                        {isPlaying ? <Pause sx={{ fontSize: 30 }} /> : <PlayArrow sx={{ fontSize: 30 }} />}
                      </IconButton>
                    </motion.div>

                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <IconButton
                        onClick={deleteRecording}
                        sx={{
                          width: 60,
                          height: 60,
                          bgcolor: '#FF6B6B',
                          color: 'white',
                          '&:hover': { bgcolor: '#FF4757' }
                        }}
                      >
                        <Delete sx={{ fontSize: 30 }} />
                      </IconButton>
                    </motion.div>
                  </Box>

                  <audio
                    ref={audioPlayerRef}
                    src={audioUrl}
                    onEnded={() => setIsPlaying(false)}
                    onPause={() => setIsPlaying(false)}
                    onPlay={() => setIsPlaying(true)}
                    style={{ display: 'none' }}
                  />

                  <Alert severity="success" sx={{ borderRadius: 2 }}>
                    Click the play button to listen to your recording before posting!
                  </Alert>
                </Box>
              </motion.div>
            )}

            {/* Instructions */}
            {!isRecording && !audioUrl && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ color: 'white', opacity: 0.9 }}>
                  💡 Click the microphone to start recording
                </Typography>
                <Typography variant="caption" sx={{ color: 'white', opacity: 0.8 }}>
                  Share your thoughts about the book in your own voice!
                </Typography>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AudioRecorder;