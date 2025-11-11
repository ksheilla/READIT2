import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  Avatar,
  Tooltip,
  Button,
  Chip
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import StarIcon from '@mui/icons-material/Star';
import { useNavigate } from 'react-router-dom';
import { checkForNewBadges, shouldCelebrateBadge, formatBadgeForDisplay } from '../services/badgeChecker';

function BadgeDisplay({ userId, reflections = [], recommendations = [], user = {} }) {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newBadge, setNewBadge] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchAndCheckBadges = async () => {
      try {
        setLoading(true);
        
        // Calculate user stats
        const userStats = {
          reflectionCount: reflections.filter(r => r.user_id === userId).length,
          recommendationCount: recommendations.filter(r => r.user_id === userId).length,
          currentStreak: user.current_streak || 0,
          existingBadges: badges.map(b => b.id) // Already earned badges
        };
        
        // Check for newly earned badges
        const newlyEarned = checkForNewBadges(userStats);
        
        // Show celebration for new badges (only once per badge)
        if (newlyEarned.length > 0) {
          const badgeToShow = newlyEarned[0]; // Show one at a time
          
          // Check if we should celebrate this badge
          if (shouldCelebrateBadge(badgeToShow.id, userId)) {
            setNewBadge(formatBadgeForDisplay(badgeToShow));
            
            // Add to badges list
            setBadges(prev => [...prev, badgeToShow]);
            
            // Clear celebration after 5 seconds
            setTimeout(() => {
              setNewBadge(null);
            }, 5000);
          } else {
            // Badge already celebrated, just add to list
            setBadges(prev => [...prev, badgeToShow]);
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error checking badges:', err);
        setLoading(false);
      }
    };
    
    fetchAndCheckBadges();
  }, [userId, reflections.length, recommendations.length, user.current_streak]);

  const handleBadgeClick = (badge) => {
    // Show more details about the badge
    navigate('/badges', { state: { badge } });
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const badgeVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 10
      }
    },
    hover: {
      scale: 1.05,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    }
  };

  const newBadgeVariants = {
    initial: { 
      scale: 0.5,
      opacity: 0,
      y: 50
    },
    animate: {
      scale: 1.2,
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 10
      }
    },
    exit: {
      scale: 0.8,
      opacity: 0,
      y: -50,
      transition: {
        duration: 0.3
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 2, mt: 2, textAlign: 'center' }}>
        <motion.div
          animate={{ 
            rotate: [0, 10, -10, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <EmojiEventsIcon sx={{ fontSize: 40 }} />
        </motion.div>
        <Typography color="textSecondary" sx={{ mt: 1 }}>
          Checking achievements...
        </Typography>
      </Box>
    );
  }

  if (badges.length === 0) {
    return (
      <Box sx={{ p: 2, mt: 2, textAlign: 'center' }}>
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 5, 0]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <EmojiEventsIcon sx={{ fontSize: 60, color: 'rgba(0,0,0,0.1)' }} />
        </motion.div>
        <Typography color="textSecondary" sx={{ mt: 2, mb: 1 }}>
          No badges yet - keep reading to earn them!
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          🎯 Post 3 reflections and recommend 1 book to earn your first badge!
        </Typography>
        <Button 
          variant="outlined" 
          onClick={() => navigate('/reflect')}
          sx={{ mt: 2 }}
        >
          Post a Reflection
        </Button>
      </Box>
    );
  }

  const displayedBadges = showAll ? badges : badges.slice(0, 3);
  const hasMore = badges.length > 3;

  return (
    <Box sx={{ 
      width: '100%',
      mt: 3,
      position: 'relative'
    }}>
      {/* New badge celebration animation */}
      <AnimatePresence>
        {newBadge && (
          <motion.div
            key="new-badge"
            variants={newBadgeVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{
              position: 'fixed',
              top: '20vh',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 1500,
              textAlign: 'center'
            }}
          >
            <Box sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              borderRadius: '50px',
              p: 3,
              boxShadow: '0 4px 20px rgba(102, 126, 234, 0.5)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: 250,
              minHeight: 250
            }}>
              <motion.div
                animate={{
                  scale: [1, 1.3, 1],
                  rotate: [0, 360, 0]
                }}
                transition={{ 
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Typography sx={{ fontSize: 80 }}>{newBadge.icon}</Typography>
              </motion.div>
              <Typography variant="h5" sx={{ mt: 2, fontWeight: 'bold', textAlign: 'center' }}>
                {newBadge.badge_name}!
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
                {newBadge.description}
              </Typography>
              <Button 
                variant="contained" 
                sx={{ mt: 3, bgcolor: 'white', color: '#667eea', fontWeight: 'bold' }}
                onClick={() => setNewBadge(null)}
              >
                Awesome! 🎉
              </Button>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Badge Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <EmojiEventsIcon sx={{ fontSize: 30, color: '#667eea', mr: 1 }} />
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#667eea' }}>
            Your Badges ({badges.length})
          </Typography>
          {hasMore && !showAll && (
            <Button 
              size="small" 
              onClick={() => setShowAll(true)}
              sx={{ ml: 'auto', fontSize: '0.8rem' }}
            >
              View All
            </Button>
          )}
        </Box>
      </motion.div>

      {/* Badge Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Grid container spacing={2}>
          {displayedBadges.map((badge, index) => (
            <Grid item xs={12} sm={6} md={4} key={badge.id}>
              <motion.div
                variants={badgeVariants}
                whileHover="hover"
              >
                <Card 
                  sx={{ 
                    textAlign: 'center', 
                    p: 2,
                    borderRadius: 2,
                    border: `2px solid ${badge.color}`,
                    background: `linear-gradient(135deg, ${badge.color}11 0%, ${badge.color}22 100%)`,
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                      border: `2px solid ${badge.color}`
                    }
                  }}
                  onClick={() => handleBadgeClick(badge)}
                >
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    style={{ margin: '0 auto' }}
                  >
                    <Box sx={{ 
                      width: 80, 
                      height: 80, 
                      borderRadius: '50%', 
                      bgcolor: `${badge.color}33`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2,
                      margin: '0 auto',
                      fontSize: '3rem'
                    }}>
                      {badge.icon}
                    </Box>
                  </motion.div>
                  
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 'bold', 
                      mb: 0.5,
                      color: badge.color,
                      fontSize: '1.2rem'
                    }}
                  >
                    {badge.badge_name}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ 
                      lineHeight: 1.4,
                      minHeight: 50
                    }}
                  >
                    {badge.description}
                  </Typography>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    mt: 2,
                    gap: 1
                  }}>
                    <Chip 
                      icon={<StarIcon />}
                      label={new Date(badge.earned_at).toLocaleDateString()}
                      size="small"
                      sx={{ 
                        bgcolor: `${badge.color}22`,
                        color: badge.color,
                        fontWeight: 'bold'
                      }}
                    />
                  </Box>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </motion.div>

      {/* View More/Less Button */}
      {hasMore && (
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Button 
            variant="outlined" 
            onClick={() => setShowAll(!showAll)}
            sx={{ 
              borderColor: '#667eea',
              color: '#667eea',
              '&:hover': {
                borderColor: '#667eea',
                bgcolor: 'rgba(102, 126, 234, 0.1)'
              }
            }}
          >
            {showAll ? 'Show Less' : `Show All (${badges.length})`}
          </Button>
        </Box>
      )}
    </Box>
  );
}

export default BadgeDisplay;