import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  Slider,
  Typography,
  Chip
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  VolumeUp,
  Stop,
  Settings,
  VoiceOverOff
} from '@mui/icons-material';

const TextToSpeech = ({ text, compact = false }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [rate, setRate] = useState(1.0);
  const [pitch, setPitch] = useState(1.0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [progress, setProgress] = useState(0);
  
  const utteranceRef = useRef(null);
  const progressIntervalRef = useRef(null);

  // Load available voices
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      
      // Select a good default voice (prefer English, female voices for children)
      const defaultVoice = availableVoices.find(voice => 
        voice.lang.startsWith('en') && 
        (voice.name.toLowerCase().includes('female') || 
         voice.name.toLowerCase().includes('samantha') ||
         voice.name.toLowerCase().includes('karen'))
      ) || availableVoices.find(voice => voice.lang.startsWith('en')) || availableVoices[0];
      
      setSelectedVoice(defaultVoice);
    };

    loadVoices();
    
    // Voices might load asynchronously
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setIsPaused(false);
      setProgress(0);
      stopProgressTracking();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startSpeaking = () => {
    if (!text || text.trim().length === 0) {
      alert('No text to read!');
      return;
    }

    // Stop any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;

    // Configure voice settings
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = 1.0;

    // Event handlers
    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
      startProgressTracking();
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setProgress(0);
      stopProgressTracking();
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsPlaying(false);
      setIsPaused(false);
      setProgress(0);
      stopProgressTracking();
    };

    utterance.onpause = () => {
      setIsPaused(true);
      stopProgressTracking();
    };

    utterance.onresume = () => {
      setIsPaused(false);
      startProgressTracking();
    };

    // Start speaking
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setProgress(0);
    stopProgressTracking();
  };

  const pauseSpeaking = () => {
    if (isPaused) {
      window.speechSynthesis.resume();
    } else {
      window.speechSynthesis.pause();
    }
  };

  const startProgressTracking = () => {
    stopProgressTracking();
    
    const estimatedDuration = (text.length / 10) * (1 / rate); // Rough estimate: 10 chars per second at rate 1.0
    const startTime = Date.now();
    
    progressIntervalRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      const newProgress = Math.min((elapsed / estimatedDuration) * 100, 99);
      setProgress(newProgress);
    }, 100);
  };

  const stopProgressTracking = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  const handleSettingsClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleSettingsClose = () => {
    setAnchorEl(null);
  };

  const handleVoiceChange = (voice) => {
    setSelectedVoice(voice);
    handleSettingsClose();
    
    // Restart if currently playing
    if (isPlaying) {
      stopSpeaking();
      setTimeout(() => startSpeaking(), 100);
    }
  };

  const handleRateChange = (event, newValue) => {
    setRate(newValue);
  };

  const handlePitchChange = (event, newValue) => {
    setPitch(newValue);
  };

  if (compact) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Tooltip title={isPlaying ? (isPaused ? "Resume reading" : "Pause reading") : "Read aloud"}>
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <IconButton
              onClick={isPlaying ? pauseSpeaking : startSpeaking}
              size="small"
              sx={{
                color: isPlaying ? '#FF6B6B' : '#4ECDC4',
                bgcolor: isPlaying ? 'rgba(255, 107, 107, 0.1)' : 'rgba(78, 205, 196, 0.1)',
                '&:hover': {
                  bgcolor: isPlaying ? 'rgba(255, 107, 107, 0.2)' : 'rgba(78, 205, 196, 0.2)'
                }
              }}
            >
              {isPlaying ? (isPaused ? <VolumeUp /> : <VolumeUp />) : <VolumeUp />}
            </IconButton>
          </motion.div>
        </Tooltip>

        {isPlaying && (
          <>
            <Tooltip title="Stop reading">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <IconButton
                  onClick={stopSpeaking}
                  size="small"
                  sx={{ color: '#FF6B6B' }}
                >
                  <Stop />
                </IconButton>
              </motion.div>
            </Tooltip>
            
            <Chip 
              label={isPaused ? "Paused" : "Reading..."} 
              size="small"
              sx={{ 
                bgcolor: isPaused ? '#FFE66D' : '#4ECDC4',
                color: 'white',
                fontWeight: 'bold'
              }}
            />
          </>
        )}

        <Tooltip title="Voice settings">
          <IconButton
            onClick={handleSettingsClick}
            size="small"
            sx={{ color: '#667eea' }}
          >
            <Settings />
          </IconButton>
        </Tooltip>

        {/* Settings Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleSettingsClose}
        >
          <MenuItem disabled>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
              Voice Settings
            </Typography>
          </MenuItem>
          
          <Box sx={{ px: 2, py: 1, minWidth: 250 }}>
            <Typography variant="caption" color="text.secondary">
              Speed: {rate.toFixed(1)}x
            </Typography>
            <Slider
              value={rate}
              onChange={handleRateChange}
              min={0.5}
              max={2.0}
              step={0.1}
              size="small"
              sx={{ color: '#4ECDC4' }}
            />
          </Box>

          <Box sx={{ px: 2, py: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Pitch: {pitch.toFixed(1)}
            </Typography>
            <Slider
              value={pitch}
              onChange={handlePitchChange}
              min={0.5}
              max={2.0}
              step={0.1}
              size="small"
              sx={{ color: '#667eea' }}
            />
          </Box>

          <MenuItem disabled>
            <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
              Select Voice:
            </Typography>
          </MenuItem>
          
          {voices.filter(v => v.lang.startsWith('en')).slice(0, 5).map((voice) => (
            <MenuItem 
              key={voice.name}
              onClick={() => handleVoiceChange(voice)}
              selected={selectedVoice?.name === voice.name}
            >
              <Typography variant="body2">
                {voice.name.split(' ')[0]} {voice.lang}
              </Typography>
            </MenuItem>
          ))}
        </Menu>
      </Box>
    );
  }

  // Full version (not compact)
  return (
    <Box sx={{ 
      bgcolor: 'rgba(78, 205, 196, 0.05)',
      borderRadius: 3,
      p: 2,
      border: '2px solid #4ECDC4'
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
          <VolumeUp /> Read Aloud
        </Typography>
        
        <IconButton
          onClick={handleSettingsClick}
          size="small"
          sx={{ color: '#667eea' }}
        >
          <Settings />
        </IconButton>
      </Box>

      {/* Progress Bar */}
      {isPlaying && (
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Typography sx={{ fontSize: 24 }}>🔊</Typography>
            </motion.div>
            <Typography variant="body2" color="text.secondary">
              {isPaused ? 'Paused' : 'Reading your reflection...'}
            </Typography>
          </Box>
          
          <Slider
            value={progress}
            min={0}
            max={100}
            disabled
            size="small"
            sx={{
              color: '#4ECDC4',
              '& .MuiSlider-thumb': { display: 'none' }
            }}
          />
        </Box>
      )}

      {/* Control Buttons */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
        {!isPlaying ? (
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <IconButton
              onClick={startSpeaking}
              sx={{
                width: 60,
                height: 60,
                bgcolor: '#4ECDC4',
                color: 'white',
                '&:hover': { bgcolor: '#44A08D' }
              }}
            >
              <VolumeUp sx={{ fontSize: 30 }} />
            </IconButton>
          </motion.div>
        ) : (
          <>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <IconButton
                onClick={pauseSpeaking}
                sx={{
                  width: 60,
                  height: 60,
                  bgcolor: '#FFE66D',
                  color: '#333',
                  '&:hover': { bgcolor: '#FFD700' }
                }}
              >
                {isPaused ? <VolumeUp sx={{ fontSize: 30 }} /> : <VoiceOverOff sx={{ fontSize: 30 }} />}
              </IconButton>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <IconButton
                onClick={stopSpeaking}
                sx={{
                  width: 60,
                  height: 60,
                  bgcolor: '#FF6B6B',
                  color: 'white',
                  '&:hover': { bgcolor: '#FF4757' }
                }}
              >
                <Stop sx={{ fontSize: 30 }} />
              </IconButton>
            </motion.div>
          </>
        )}
      </Box>

      {/* Voice Info */}
      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          Voice: {selectedVoice?.name || 'Default'} • Speed: {rate}x • Pitch: {pitch.toFixed(1)}
        </Typography>
      </Box>

      {/* Settings Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleSettingsClose}
      >
        <MenuItem disabled>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
            Voice Settings
          </Typography>
        </MenuItem>
        
        <Box sx={{ px: 2, py: 1, minWidth: 250 }}>
          <Typography variant="caption" color="text.secondary">
            Speed: {rate.toFixed(1)}x
          </Typography>
          <Slider
            value={rate}
            onChange={handleRateChange}
            min={0.5}
            max={2.0}
            step={0.1}
            size="small"
            sx={{ color: '#4ECDC4' }}
          />
        </Box>

        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Pitch: {pitch.toFixed(1)}
          </Typography>
          <Slider
            value={pitch}
            onChange={handlePitchChange}
            min={0.5}
            max={2.0}
            step={0.1}
            size="small"
            sx={{ color: '#667eea' }}
          />
        </Box>

        <MenuItem disabled>
          <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
            Select Voice:
          </Typography>
        </MenuItem>
        
        {voices.filter(v => v.lang.startsWith('en')).slice(0, 8).map((voice) => (
          <MenuItem 
            key={voice.name}
            onClick={() => handleVoiceChange(voice)}
            selected={selectedVoice?.name === voice.name}
          >
            <Typography variant="body2">
              {voice.name.split(' ')[0]} ({voice.lang})
            </Typography>
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};

export default TextToSpeech;