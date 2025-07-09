
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
const API_PROFILES_URL = `${API_BASE_URL}/api/profiles`;

const api = axios.create({
  baseURL: API_PROFILES_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true
});

api.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Centralized profile service for all profile-related data fetching and aggregation
export const profileService = {
  // Fetches the full user profile (all platforms, merged)
  getUserProfile: async (userId, email, name) => {
    // Always include email and name as query params if provided
    let url = `/${userId}`;
    const params = [];
    if (email) params.push(`email=${encodeURIComponent(email)}`);
    if (name) params.push(`name=${encodeURIComponent(name)}`);
    if (params.length > 0) url += `?${params.join('&')}`;
    const response = await api.get(url);
    return response.data;
  },

  // Fetches stats for a specific platform
  getPlatformStats: async (userId, platform) => {
    if (platform === 'github') {
      return await profileService.getGitHubStats(userId);
    }
    const response = await api.get(`/${userId}/${platform}`);
    return response.data;
  },

  // Updates a platform username
  updatePlatformUsername: async (userId, platform, username) => {
    const response = await api.put(`/${userId}/${platform}`, { username });
    return response.data;
  },

  // Fetches GitHub stats (special endpoint)
  getGitHubStats: async (userId) => {
    const response = await api.get(`/${userId}/github/stats`);
    return response.data;
  },

  // Aggregates stats across all platforms for overview
  aggregateProfileStats: (profileData) => {
    let totalQuestions = 0;
    let totalActiveDays = 0;
    let topicWise = {};
    let easySum = 0, mediumSum = 0, hardSum = 0;
    let contestStats = {};
    let ratingHistory = [];

    if (profileData) {
      Object.entries(profileData).forEach(([key, stats]) => {
        if (key.endsWith('Stats') && typeof stats === 'object' && stats !== null) {
          totalQuestions += typeof stats.totalQuestions === 'number' ? stats.totalQuestions : 0;
          totalActiveDays += stats.totalActiveDays || 0;
          if (stats.topicWiseSolved) {
            Object.entries(stats.topicWiseSolved).forEach(([topic, count]) => {
              topicWise[topic] = (topicWise[topic] || 0) + (count || 0);
            });
          }
          if (stats.difficultyWiseSolved) {
            Object.entries(stats.difficultyWiseSolved).forEach(([diff, count]) => {
              const key = String(diff).toLowerCase();
              if (key === 'easy') easySum += Number(count) || 0;
              if (key === 'medium') mediumSum += Number(count) || 0;
              if (key === 'hard') hardSum += Number(count) || 0;
            });
          }
          const platName = key.replace('Stats', '');
          if (!contestStats[platName]) contestStats[platName] = {};
          contestStats[platName].totalContests = (contestStats[platName].totalContests || 0) + (stats.totalContests || 0);
          contestStats[platName].rating = Math.max(contestStats[platName].rating || 0, stats.rating || 0);
          contestStats[platName].ranking = Math.min(
            contestStats[platName].ranking === undefined ? Infinity : contestStats[platName].ranking,
            stats.contestRanking === undefined ? Infinity : stats.contestRanking
          );
          if (Array.isArray(stats.ratingHistory)) {
            ratingHistory = ratingHistory.concat(stats.ratingHistory);
          }
        }
      });
    }
    let difficultyWise = { easy: easySum, medium: mediumSum, hard: hardSum };
    return {
      totalQuestions,
      totalActiveDays,
      topicWise,
      difficultyWise,
      contestStats,
      ratingHistory
    };
  },

  // Fetches and aggregates all profile data for a user (for Profile.jsx)
  fetchAndAggregateProfile: async (userId, email, name) => {
    const profileData = await profileService.getUserProfile(userId, email, name);
    const aggregate = profileService.aggregateProfileStats(profileData);
    return { profileData, ...aggregate };
  },

  // Fetches stats for a specific platform (for PlatformProfile)
  fetchPlatformProfile: async (userId, platform) => {
    return await profileService.getPlatformStats(userId, platform);
  },

  // Fetches GitHub stats (for GitHubProfileWrapper)
  fetchGitHubProfile: async (userId) => {
    return await profileService.getGitHubStats(userId);
  }
};
