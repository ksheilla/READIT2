import React, { useState, useRef, useEffect } from 'react';
import { Box, IconButton, Menu, MenuItem, Slider, Typography } from '@mui/material';
import { VolumeUp, Stop, Settings, VoiceOverOff } from '@mui/icons-material';
import { motion } from 'framer-motion';

const TextToSpeech = ({ text }) => {
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

  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      setSelectedVoice(availableVoices.find(v => v.lang.startsWith('en')) || availableVoices[0]);
    };

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      stopSpeaking();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  const startSpeaking = () => {
    if (!text || text.trim().length === 0) return;
    if (typeof window === 'undefined') return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;
    utterance.voice = selectedVoice;
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = 1.0;

    utterance.onstart = () => { setIsPlaying(true); setIsPaused(false); startProgressTracking(); };
    utterance.onend = () => { setIsPlaying(false); setIsPaused(false); setProgress(0); stopProgressTracking(); };
    utterance.onerror = () => { setIsPlaying(false); setIsPaused(false); setProgress(0); stopProgressTracking(); };

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (typeof window === 'undefined') return;
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setProgress(0);
    stopProgressTracking();
  };

  const startProgressTracking = () => {
    stopProgressTracking();
    const estimatedDuration = (text.length / 10) * (1 / rate);
    const startTime = Date.now();
    progressIntervalRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      const newProgress = Math.min((elapsed / estimatedDuration) * 100, 99);
      setProgress(newProgress);
    }, 100);
  };

  const stopProgressTracking = () => {
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
  };

  return (
    <Box>
      <IconButton onClick={startSpeaking}>
        <VolumeUp />
      </IconButton>
      <IconButton onClick={stopSpeaking}>
        <Stop />
      </IconButton>
      <Slider value={progress} min={0} max={100} disabled />
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        {voices.map(v => <MenuItem key={v.name} onClick={() => setSelectedVoice(v)}>{v.name}</MenuItem>)}
      </Menu>
    </Box>
  );
};

export default TextToSpeech;
