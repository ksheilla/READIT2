// ============================================================================
// Animated LeaderboardPage.jsx with Trophies, Medals & Confetti
// Replace your src/pages/LeaderboardPage.jsx with this
// ============================================================================

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
  Button,
  Avatar,
  Chip,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  EmojiEvents, 
  ArrowBack,
  LocalFireDepartment,
  Star,
  TrendingUp,
  School
} from '@mui/icons-material';

function LeaderboardPage() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const navigate = useNavigate();
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

        // Show confetti if user is in top 3
        const userRank = data.findIndex(leader => leader.id === user?.id);
        if (userRank >= 0 && userRank < 3) {
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 3000);
        }
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
        setError('Could not load leaderboard. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchLeaderboard();
  }, [user?.id]);

  const getRankEmoji = (rank) => {
    switch(rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  const getRankColor = (rank) => {
    switch(rank) {
      case 1: return 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)';
      case 2: return 'linear-gradient(135deg, #C0C0C0 0%, #808080 100%)';
      case 3: return 'linear-gradient(135deg, #CD7F32 0%, #8B4513 100%)';
      default: return 'transparent';
    }
  };

  const getTrophySize = (rank) => {
    switch(rank) {
      case 1: return 80;
      case 2: return 60;
      case 3: return 50;
      default: return 40;
    }
  };

  const confettiEmojis = ['🎉', '🎊', '⭐', '✨', '🌟', '💫', '🎈', '🎆', '🏆', '👑'];

  const floatingTrophies = [
    { emoji: '🏆', top: '10%', left: '5%', delay: 0 },
    { emoji: '🥇', top: '30%', right: '8%', delay: 0.5 },
    { emoji: '⭐', bottom: '20%', left: '10%', delay: 1 },
    { emoji: '👑', top: '50%', right: '5%', delay: 1.5 },
  ];

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

  const userRank = leaders.findIndex(leader => leader.id === user.id) + 1;
  const userStats = leaders.find(leader => leader.id === user.id);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #FF6B6B 0%, #FFE66D 100%)',
        py: 4,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Floating Trophies */}
      {floatingTrophies.map((trophy, index) => (
        <motion.div
          key={index}
          style={{
            position: 'absolute',
            fontSize: '3rem',
            opacity: 0.15,
            ...trophy
          }}
          animate={{
            y: [0, -30, 0],
            rotate: [0, 360],
          }}
          transition={{
            duration: 4 + trophy.delay,
            repeat: Infinity,
            ease: "easeInOut",
            delay: trophy.delay
          }}
        >
          {trophy.emoji}
        </motion.div>
      ))}

      {/* Confetti Effect */}
      <AnimatePresence>
        {showConfetti && confettiEmojis.map((emoji, i) => (
          <motion.div
            key={`confetti-${i}`}
            style={{
              position: 'fixed',
              fontSize: '2rem',
              left: '50%',
              top: '20%',
              zIndex: 9999
            }}
            initial={{ opacity: 0 }}
            animate={{
              x: [(Math.random() - 0.5) * 200, (Math.random() - 0.5) * 600],
              y: [0, window.innerHeight],
              rotate: [0, Math.random() * 720],
              opacity: [1, 0]
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 3,
              ease: "easeOut",
              delay: i * 0.1
            }}
          >
            {emoji}
          </motion.div>
        ))}
      </AnimatePresence>

      <Container maxWidth="lg">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100 }}
        >
          {/* Header */}
          <Paper
            elevation={12}
            sx={{
              borderRadius: 4,
              overflow: 'hidden',
              background: 'rgba(255, 255, 255, 0.98)',
              mb: 3
            }}
          >
            <Box
              sx={{
                background: 'linear-gradient(135deg, #FF6B6B 0%, #FFE66D 100%)',
                p: 3,
                color: 'white'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Button
                    startIcon={<ArrowBack />}
                    onClick={() => navigate('/home')}
                    sx={{ 
                      color: 'white',
                      mr: 2,
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                    }}
                  >
                    Back
                  </Button>
                </motion.div>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                    Reading Champions 🏆
                  </Typography>
                  <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                    See who's reading the most!
                  </Typography>
                </Box>
                <motion.div
                  animate={{
                    rotate: [0, -10, 10, 0],
                    scale: [1, 1.2, 1]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <EmojiEvents sx={{ fontSize: 80, color: '#FFD700' }} />
                </motion.div>
              </Box>
            </Box>
          </Paper>

          {/* Your Stats Card */}
          {userStats && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Card
                sx={{
                  mb: 3,
                  background: userRank <= 3 
                    ? getRankColor(userRank)
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: '3px solid white',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
                }}
              >
                <CardContent>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item>
                      <motion.div
                        animate={userRank <= 3 ? {
                          rotate: [0, 360],
                          scale: [1, 1.2, 1]
                        } : {}}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        <Typography sx={{ fontSize: 60 }}>
                          {userRank <= 3 ? getRankEmoji(userRank) : '🌟'}
                        </Typography>
                      </motion.div>
                    </Grid>
                    <Grid item xs>
                      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                        Your Rank: #{userRank}
                        {userRank <= 3 && (
                          <motion.span
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                            style={{ marginLeft: 8 }}
                          >
                            🎉
                          </motion.span>
                        )}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <Chip 
                          icon={<LocalFireDepartment />}
                          label={`${userStats.current_streak} Day Streak`}
                          sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                        />
                        <Chip 
                          icon={<School />}
                          label={userStats.school}
                          sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                        />
                      </Box>
                    </Grid>
                    {userRank <= 3 && (
                      <Grid item>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                            Top {userRank}!
                          </Typography>
                          <Typography variant="caption">
                            Amazing work! 🎊
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Main Leaderboard */}
          <Paper
            elevation={12}
            sx={{
              borderRadius: 4,
              overflow: 'hidden',
              background: 'rgba(255, 255, 255, 0.98)'
            }}
          >
            <Box sx={{ p: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUp color="primary" />
                Top Readers
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                  {error}
                </Alert>
              )}
              
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <CircularProgress size={60} />
                  </motion.div>
                </Box>
              ) : leaders.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <motion.div
                    animate={{
                      rotate: [0, 10, -10, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <Typography sx={{ fontSize: 100, mb: 2 }}>📚</Typography>
                  </motion.div>
                  <Typography variant="h6" color="text.secondary">
                    No data available yet
                  </Typography>
                  <Typography color="text.secondary">
                    Be the first to start reading!
                  </Typography>
                </Box>
              ) : (
                <>
                  {/* Top 3 Podium */}
                  <Box sx={{ mb: 4 }}>
                    <Grid container spacing={2} justifyContent="center" alignItems="flex-end">
                      {/* 2nd Place */}
                      {leaders[1] && (
                        <Grid item xs={12} sm={4}>
                          <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                          >
                            <Card
                              sx={{
                                background: getRankColor(2),
                                color: 'white',
                                textAlign: 'center',
                                height: 200,
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center'
                              }}
                            >
                              <CardContent>
                                <motion.div
                                  animate={{ y: [0, -10, 0] }}
                                  transition={{ duration: 2, repeat: Infinity }}
                                >
                                  <Typography sx={{ fontSize: getTrophySize(2) }}>
                                    {getRankEmoji(2)}
                                  </Typography>
                                </motion.div>
                                <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 1 }}>
                                  {leaders[1].name}
                                </Typography>
                                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                  {leaders[1].school}
                                </Typography>
                                <Chip 
                                  label={`${leaders[1].current_streak} days`}
                                  size="small"
                                  sx={{ mt: 1, bgcolor: 'rgba(255,255,255,0.3)', color: 'white' }}
                                />
                              </CardContent>
                            </Card>
                          </motion.div>
                        </Grid>
                      )}

                      {/* 1st Place */}
                      {leaders[0] && (
                        <Grid item xs={12} sm={4}>
                          <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.1 }}
                          >
                            <Card
                              sx={{
                                background: getRankColor(1),
                                color: 'white',
                                textAlign: 'center',
                                height: 250,
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                border: '3px solid #FFD700',
                                boxShadow: '0 12px 40px rgba(255, 215, 0, 0.5)'
                              }}
                            >
                              <CardContent>
                                <motion.div
                                  animate={{
                                    rotate: [0, 360],
                                    scale: [1, 1.2, 1]
                                  }}
                                  transition={{ duration: 3, repeat: Infinity }}
                                >
                                  <Typography sx={{ fontSize: getTrophySize(1) }}>
                                    {getRankEmoji(1)}
                                  </Typography>
                                </motion.div>
                                <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 1 }}>
                                  {leaders[0].name}
                                </Typography>
                                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                  {leaders[0].school}
                                </Typography>
                                <Chip 
                                  icon={<Star />}
                                  label={`${leaders[0].current_streak} days`}
                                  sx={{ mt: 1, bgcolor: 'rgba(255,255,255,0.3)', color: 'white' }}
                                />
                                <Typography variant="caption" sx={{ display: 'block', mt: 1, fontWeight: 'bold' }}>
                                  👑 CHAMPION 👑
                                </Typography>
                              </CardContent>
                            </Card>
                          </motion.div>
                        </Grid>
                      )}

                      {/* 3rd Place */}
                      {leaders[2] && (
                        <Grid item xs={12} sm={4}>
                          <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                          >
                            <Card
                              sx={{
                                background: getRankColor(3),
                                color: 'white',
                                textAlign: 'center',
                                height: 180,
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center'
                              }}
                            >
                              <CardContent>
                                <motion.div
                                  animate={{ y: [0, -8, 0] }}
                                  transition={{ duration: 2.5, repeat: Infinity }}
                                >
                                  <Typography sx={{ fontSize: getTrophySize(3) }}>
                                    {getRankEmoji(3)}
                                  </Typography>
                                </motion.div>
                                <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 1 }}>
                                  {leaders[2].name}
                                </Typography>
                                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                  {leaders[2].school}
                                </Typography>
                                <Chip 
                                  label={`${leaders[2].current_streak} days`}
                                  size="small"
                                  sx={{ mt: 1, bgcolor: 'rgba(255,255,255,0.3)', color: 'white' }}
                                />
                              </CardContent>
                            </Card>
                          </motion.div>
                        </Grid>
                      )}
                    </Grid>
                  </Box>

                  {/* Full Leaderboard Table */}
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ bgcolor: '#F5F5F5' }}>
                          <TableCell sx={{ fontWeight: 'bold' }}>Rank</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Reader</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>School</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Streak</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <AnimatePresence>
                          {leaders.map((leader, index) => (
                            <motion.tr
                              key={leader.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              component={TableRow}
                              sx={{ 
                                bgcolor: leader.id === user.id ? '#E3F2FD' : 'inherit',
                                borderLeft: leader.id === user.id ? '4px solid #2196F3' : 'none',
                                '&:hover': { bgcolor: '#F5F5F5' }
                              }}
                            >
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography sx={{ fontSize: 24 }}>
                                    {getRankEmoji(index + 1)}
                                  </Typography>
                                  {leader.id === user.id && (
                                    <Chip label="You" size="small" color="primary" />
                                  )}
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                  <Avatar sx={{ bgcolor: index < 3 ? '#FFD700' : '#4ECDC4' }}>
                                    {leader.name.charAt(0)}
                                  </Avatar>
                                  <Typography sx={{ fontWeight: leader.id === user.id ? 'bold' : 'normal' }}>
                                    {leader.name}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell>{leader.school}</TableCell>
                              <TableCell>
                                <Chip 
                                  icon={<LocalFireDepartment />}
                                  label={`${leader.current_streak} days`}
                                  color={leader.current_streak >= 30 ? 'error' : leader.current_streak >= 7 ? 'warning' : 'default'}
                                  variant={index < 3 ? 'filled' : 'outlined'}
                                />
                              </TableCell>
                            </motion.tr>
                          ))}
                        </AnimatePresence>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              )}
            </Box>
          </Paper>

          {/* Motivational Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Paper
              sx={{
                mt: 3,
                p: 3,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                textAlign: 'center',
                borderRadius: 3
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                Keep Reading, Keep Growing! 📚✨
              </Typography>
              <Typography variant="body2">
                Every page you read brings you closer to the top! 
                {userRank > 3 ? ' You can do it! 💪' : ' You\'re doing amazing! 🌟'}
              </Typography>
            </Paper>
          </motion.div>
        </motion.div>
      </Container>
    </Box>
  );
}

export default LeaderboardPage;