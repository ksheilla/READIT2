import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Card, Grid, Chip } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { checkForNewBadges, shouldCelebrateBadge, formatBadgeForDisplay } from '../services/badgeChecker';

function BadgeDisplay({ userId, reflections = [], recommendations = [], user = {} }) {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newBadge, setNewBadge] = useState(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return; // SSR-safe

    const fetchAndCheckBadges = async () => {
      try {
        setLoading(true);
        const reflectionCount = reflections.filter(r => r.user_id === userId).length;
        const recommendationCount = recommendations.filter(r => r.user_id === userId).length;
        const currentStreak = user.current_streak || 0;
        
        setBadges(prevBadges => {
          const userStats = {
            reflectionCount,
            recommendationCount,
            currentStreak,
            existingBadges: prevBadges.map(b => b.id)
          };
          const newlyEarned = checkForNewBadges(userStats);
          if (newlyEarned.length > 0) {
            const badgeToShow = newlyEarned[0];
            if (shouldCelebrateBadge(badgeToShow.id, userId)) {
              setNewBadge(formatBadgeForDisplay(badgeToShow));
              if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
              }
              timeoutRef.current = setTimeout(() => setNewBadge(null), 5000);
              return [...prevBadges, badgeToShow];
            } else {
              return [...prevBadges, badgeToShow];
            }
          }
          return prevBadges;
        });
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    fetchAndCheckBadges();
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [userId, reflections, recommendations, user.current_streak]);

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
