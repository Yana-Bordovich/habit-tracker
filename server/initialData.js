const getInitialState = () => ({
  habits: [],
  xp: 0,
  level: 1,
  achievements: [],
  theme: 'dark',
  primaryColor: '#4F46E5', // Default custom color
  avatarUrl: null,
});

module.exports = { getInitialState };