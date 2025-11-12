// src/services/badgeChecker.js
// Service to check and award badges based on user achievements

export const BADGE_CRITERIA = {
  FIRST_REFLECTION: {
    id: 'first_reflection',
    name: 'First Reflection',
    description: 'Posted your first reflection',
    icon: '⭐',
    color: '#FF6B6B',
    check: (stats) => stats.reflectionCount >= 1
  },
  BOOKWORM: {
    id: 'bookworm',
    name: 'Bookworm',
    description: 'Posted 3 reflections',
    icon: '📚',
    color: '#4ECDC4',
    check: (stats) => stats.reflectionCount >= 3
  },
  BOOK_SHARER: {
    id: 'book_sharer',
    name: 'Book Sharer',
    description: 'Recommended 1 book',
    icon: '💡',
    color: '#FFE66D',
    check: (stats) => stats.recommendationCount >= 1
  },
  READING_CHAMPION: {
    id: 'reading_champion',
    name: 'Reading Champion',
    description: 'Posted 3 reflections and recommended 1 book',
    icon: '🏆',
    color: '#FFD700',
    check: (stats) => stats.reflectionCount >= 3 && stats.recommendationCount >= 1
  },
  FIVE_DAY_STREAK: {
    id: 'five_day_streak',
    name: '5-Day Streak',
    description: 'Read for 5 consecutive days',
    icon: '🔥',
    color: '#FF4757',
    check: (stats) => stats.currentStreak >= 5
  },
  DEDICATED_READER: {
    id: 'dedicated_reader',
    name: 'Dedicated Reader',
    description: 'Posted 10 reflections',
    icon: '📖',
    color: '#AA96DA',
    check: (stats) => stats.reflectionCount >= 10
  },
  COMMUNITY_HELPER: {
    id: 'community_helper',
    name: 'Community Helper',
    description: 'Recommended 5 books',
    icon: '🤝',
    color: '#95E1D3',
    check: (stats) => stats.recommendationCount >= 5
  }
};

/**
 * Check which badges a user has earned based on their stats
 * @param {Object} userStats - User's current statistics
 * @param {number} userStats.reflectionCount - Number of reflections posted
 * @param {number} userStats.recommendationCount - Number of recommendations posted
 * @param {number} userStats.currentStreak - Current reading streak
 * @param {Array} userStats.existingBadges - Array of badge IDs user already has
 * @returns {Array} - Array of newly earned badge objects
 */
export const checkForNewBadges = (userStats) => {
  const newlyEarnedBadges = [];
  const existingBadgeIds = new Set(userStats.existingBadges || []);

  Object.values(BADGE_CRITERIA).forEach(badge => {
    // If user already has this badge, skip
    if (existingBadgeIds.has(badge.id)) {
      return;
    }

    // Check if user meets criteria for this badge
    if (badge.check(userStats)) {
      newlyEarnedBadges.push({
        id: badge.id,
        badge_name: badge.name,
        description: badge.description,
        icon: badge.icon,
        color: badge.color,
        earned_at: new Date().toISOString()
      });
    }
  });

  return newlyEarnedBadges;
};

/**
 * Get user statistics from API data
 * @param {number} userId - User ID
 * @param {Array} reflections - All reflections
 * @param {Array} recommendations - All recommendations
 * @param {Object} user - User object with streak info
 * @returns {Object} - User statistics
 */
export const getUserStats = (userId, reflections, recommendations, user) => {
  return {
    reflectionCount: reflections.filter(r => r.user_id === userId).length,
    recommendationCount: recommendations.filter(r => r.user_id === userId).length,
    currentStreak: user?.current_streak || 0,
    existingBadges: [] // This should be fetched from your badges table
  };
};

/**
 * Check if user should see badge celebration
 * Uses localStorage to track which badges have been celebrated
 * @param {string} badgeId - Badge ID to check
 * @param {number} userId - User ID
 * @returns {boolean} - Whether to show celebration
 */
export const shouldCelebrateBadge = (badgeId, userId) => {
  const celebratedKey = `badge_celebrated_${userId}_${badgeId}`;
  const wasCelebrated = localStorage.getItem(celebratedKey);
  
  if (wasCelebrated) {
    return false;
  }
  
  // Mark as celebrated
  localStorage.setItem(celebratedKey, 'true');
  return true;
};

/**
 * Format badge for display
 * @param {Object} badge - Badge object
 * @returns {Object} - Formatted badge with animation properties
 */
export const formatBadgeForDisplay = (badge) => {
  return {
    ...badge,
    animation: {
      scale: [1, 1.2, 1],
      rotate: [0, 10, -10, 0]
    }
  };
};