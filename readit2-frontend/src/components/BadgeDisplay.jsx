import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, Grid, Chip, Button } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { checkForNewBadges, shouldCelebrateBadge, formatBadgeForDisplay } from '../services/badgeChecker';
import { useNavigate } from 'react-router-dom';

function BadgeDisplay({ userId, reflections = [], recommendations = [], user = {} }) {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newBadge, setNewBadge] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (typeof window === 'undefined') return; // SSR-safe

    let timeoutId;
    const fetchAndCheckBadges = async () => {
      try {
        setLoading(true);
        const userStats = {
          reflectionCount: reflections.filter(r => r.user_id === userId).length,
          recommendationCount: recommendations.filter(r => r.user_id === userId).length,
          currentStreak: user.current_streak || 0,
          existingBadges: badges.map(b => b.id)
        };
        const newlyEarned = checkForNewBadges(userStats);
        if (newlyEarned.length > 0) {
          const badgeToShow = newlyEarned[0];
          if (shouldCelebrateBadge(badgeToShow.id, userId)) {
            setNewBadge(formatBadgeForDisplay(badgeToShow));
            setBadges(prev => [...prev, badgeToShow]);
            timeoutId = setTimeout(() => setNewBadge(null), 5000);
          } else {
            setBadges(prev => [...prev, badgeToShow]);
          }
        }
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    fetchAndCheckBadges();
    return () => clearTimeout(timeoutId);
  }, [userId, reflections.length, recommendations.length, user.current_streak]);

  return (
    <Box>
      {loading && <Typography>Loading badges...</Typography>}
      {!loading && badges.length === 0 && (
        <Typography>No badges yet!</Typography>
      )}
      {!loading && badges.length > 0 && (
        <Grid container spacing={2}>
          {badges.map((badge) => (
            <Grid item key={badge.id}>
              <Card>
                <Typography>{badge.badge_name}</Typography>
                <Typography>{badge.description}</Typography>
                <Chip label={new Date(badge.earned_at).toLocaleDateString()} />
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      <AnimatePresence>
        {newBadge && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Typography>New badge earned: {newBadge.badge_name}</Typography>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
}

export default BadgeDisplay;
