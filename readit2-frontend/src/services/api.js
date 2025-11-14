import axios from 'axios';

// ✅ Keep '/api' because your backend uses /api/login, /api/register, etc.
const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000/api';

// Create axios instance for standard API requests
export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Create axios instance for multipart form data (file uploads)
export const uploadApi = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'multipart/form-data'
  }
});

// Add interceptors for request and response
api.interceptors.request.use((config) => {
  console.log('API Request:', config.method.toUpperCase(), config.url);
  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.data);
    return response;
  },
  (error) => {
    console.error('API Error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Status code:', error.response.status);
    }
    return Promise.reject(error);
  }
);

// Register a new user
export const register = async (userData) => {
  const response = await api.post('/register', userData);
  return response.data;
};

// Login a user
export const login = async (credentials) => {
  const response = await api.post('/login', credentials);
  return response.data;
};

// Get all reflections
export const getReflections = async () => {
  const response = await api.get('/reflections');
  return response.data;
};

// Post a reflection
export const postReflection = async (reflectionData) => {
  const response = await api.post('/reflections', reflectionData);
  return response.data;
};

// Upload audio reflection
export const uploadAudio = async (audioData) => {
  const response = await uploadApi.post('/upload-audio', audioData);
  return response.data;
};

// Get leaderboard
export const getLeaderboard = async () => {
  const response = await api.get('/leaderboard');
  return response.data;
};