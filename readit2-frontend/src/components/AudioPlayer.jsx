import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  IconButton,
  Typography,
  Slider,
  Chip,
  Tooltip
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  PlayArrow,
  Pause,
  VolumeUp,
  VolumeOff,
  Replay10,
  Forward10
} from '@mui/icons-material';

const AudioPlayer = ({ audioUrl, compact = false }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [canPlay, setCanPlay] = useState(false);
  
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(audio.duration);
        setIsLoading(false);
        setCanPlay(true);
      }
    };

    const handleTimeUpdate = () => {
      if (audio.currentTime && !isNaN(audio.currentTime) && isFinite(audio.currentTime)) {
        setCurrentTime(audio.currentTime);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
      setCanPlay(true);
    };

    const handleError = (e) => {
      console.error('Audio error:', e);
      setIsLoading(false);
      setCanPlay(false);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('error', handleError);
    };
  }, [audioUrl]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio || !canPlay) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(err => {
        console.error('Play error:', err);
      });
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (event, newValue) => {
    console.log('🎯 Seek attempt:', { newValue, duration, canPlay, currentTime });
    
    const audio = audioRef.current;
    if (!audio) {
      console.log('❌ No audio element');
      return;
    }
    
    if (!canPlay) {
      console.log('❌ Audio not ready to play');
      return;
    }
    
    if (!duration || isNaN(duration) || !isFinite(duration)) {
      console.log('❌ Invalid duration:', duration);
      return;
    }
    
    // Ensure newValue is valid
    if (isNaN(newValue) || !isFinite(newValue)) {
      console.log('❌ Invalid seek value:', newValue);
      return;
    }
    
    const seekTime = Math.min(Math.max(0, newValue), duration);
    console.log('✅ Seeking to:', seekTime);
    
    try {
      audio.currentTime = seekTime;
      setCurrentTime(seekTime);
      console.log('✅ Seek successful!');
    } catch (err) {
      console.error('❌ Seek error:', err);
    }
  };

  const handleVolumeChange = (event, newValue) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    audio.volume = newValue;
    setVolume(newValue);
    setIsMuted(newValue === 0);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    if (isMuted) {
      audio.volume = volume || 0.5;
      setVolume(volume || 0.5);
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  };

  const skip = (seconds) => {
    const audio = audioRef.current;
    if (!audio || !canPlay || !duration || isNaN(duration) || !isFinite(duration)) {
      return;
    }
    
    const newTime = Math.max(0, Math.min(duration, audio.currentTime + seconds));
    if (!isNaN(newTime) && isFinite(newTime)) {
      audio.currentTime = newTime;
    }
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds) || !isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Safely get max value for slider
  const getSliderMax = () => {
    if (duration && !isNaN(duration) && isFinite(duration) && duration > 0) {
      return duration;
    }
    return 100;
  };

  // Safely get current value for slider
  const getSliderValue = () => {
    if (currentTime && !isNaN(currentTime) && isFinite(currentTime)) {
      return Math.min(currentTime, getSliderMax());
    }
    return 0;
  };

  if (compact) {
    return (
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1,
        bgcolor: 'rgba(78, 205, 196, 0.1)',
        borderRadius: 2,
        p: 1
      }}>
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <IconButton
            onClick={togglePlay}
            disabled={isLoading || !canPlay}
            size="small"
            sx={{
              bgcolor: '#4ECDC4',
              color: 'white',
              '&:hover': { bgcolor: '#44A08D' },
              '&:disabled': { bgcolor: '#E0E0E0' }
            }}
          >
            {isPlaying ? <Pause /> : <PlayArrow />}
          </IconButton>
        </motion.div>
        
        <Box sx={{ flex: 1 }}>
          <Slider
            value={getSliderValue()}
            onChange={handleSeek}
            min={0}
            max={getSliderMax()}
            disabled={isLoading || !canPlay}
            size="small"
            sx={{
              color: '#4ECDC4',
              '& .MuiSlider-thumb': {
                width: 12,
                height: 12
              }
            }}
          />
        </Box>
        
        <Typography variant="caption" sx={{ minWidth: 50, textAlign: 'right' }}>
          {formatTime(currentTime)} / {formatTime(duration)}
        </Typography>
        
        <audio ref={audioRef} src={audioUrl} preload="metadata" />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      bgcolor: 'rgba(78, 205, 196, 0.05)',
      borderRadius: 3,
      p: 2,
      border: '2px solid #4ECDC4'
    }}>
      {/* Waveform Visualization Effect */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        gap: 0.5,
        mb: 2,
        height: 40
      }}>
        {isPlaying && [...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              height: [10, Math.random() * 30 + 10, 10],
              backgroundColor: ['#4ECDC4', '#44A08D', '#4ECDC4']
            }}
            transition={{
              duration: 0.5 + Math.random() * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.05
            }}
            style={{
              width: 3,
              borderRadius: 2,
              backgroundColor: '#4ECDC4'
            }}
          />
        ))}
        {!isPlaying && (
          <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            🎵 Audio Reflection
          </Typography>
        )}
      </Box>

      {/* Main Controls */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2 }}>
        <Tooltip title="Rewind 10s">
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <IconButton
              onClick={() => skip(-10)}
              disabled={isLoading || !canPlay}
              sx={{ color: '#4ECDC4' }}
            >
              <Replay10 />
            </IconButton>
          </motion.div>
        </Tooltip>

        <motion.div 
          whileHover={{ scale: 1.1 }} 
          whileTap={{ scale: 0.9 }}
          animate={isPlaying ? {
            scale: [1, 1.05, 1],
            boxShadow: [
              '0 0 0 0 rgba(78, 205, 196, 0.7)',
              '0 0 0 10px rgba(78, 205, 196, 0)',
              '0 0 0 0 rgba(78, 205, 196, 0)'
            ]
          } : {}}
          transition={{
            duration: 1,
            repeat: isPlaying ? Infinity : 0,
            ease: "easeInOut"
          }}
        >
          <IconButton
            onClick={togglePlay}
            disabled={isLoading || !canPlay}
            sx={{
              width: 60,
              height: 60,
              bgcolor: '#4ECDC4',
              color: 'white',
              '&:hover': { bgcolor: '#44A08D' },
              '&:disabled': { bgcolor: '#E0E0E0' }
            }}
          >
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                🎵
              </motion.div>
            ) : isPlaying ? (
              <Pause sx={{ fontSize: 30 }} />
            ) : (
              <PlayArrow sx={{ fontSize: 30 }} />
            )}
          </IconButton>
        </motion.div>

        <Tooltip title="Forward 10s">
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <IconButton
              onClick={() => skip(10)}
              disabled={isLoading || !canPlay}
              sx={{ color: '#4ECDC4' }}
            >
              <Forward10 />
            </IconButton>
          </motion.div>
        </Tooltip>
      </Box>

      {/* Progress Bar */}
      <Box sx={{ mb: 2 }}>
        <Slider
          value={getSliderValue()}
          onChange={handleSeek}
          min={0}
          max={getSliderMax()}
          disabled={isLoading || !canPlay}
          sx={{
            color: '#4ECDC4',
            '& .MuiSlider-thumb': {
              width: 16,
              height: 16,
              '&:hover, &.Mui-focusVisible': {
                boxShadow: '0 0 0 8px rgba(78, 205, 196, 0.16)'
              }
            }
          }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 1 }}>
          <Typography variant="caption" color="text.secondary">
            {formatTime(currentTime)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {formatTime(duration)}
          </Typography>
        </Box>
      </Box>

      {/* Volume Control */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton onClick={toggleMute} size="small" sx={{ color: '#4ECDC4' }}>
          {isMuted || volume === 0 ? <VolumeOff /> : <VolumeUp />}
        </IconButton>
        <Slider
          value={isMuted ? 0 : volume}
          onChange={handleVolumeChange}
          min={0}
          max={1}
          step={0.1}
          size="small"
          sx={{
            flex: 1,
            maxWidth: 100,
            color: '#4ECDC4'
          }}
        />
        <Chip 
          label={`${Math.round((isMuted ? 0 : volume) * 100)}%`} 
          size="small"
          sx={{ minWidth: 55 }}
        />
      </Box>

      <audio ref={audioRef} src={audioUrl} preload="metadata" />
    </Box>
  );
};

export default AudioPlayer;