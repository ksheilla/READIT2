import axios from 'axios';

// Replace with your backend URL when deployed
const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE,
});

// Add debugging to see API calls
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

export const register = async (userData) => {
  const response = await api.post('/register', userData);
  return response.data;
};

export const login = async (credentials) => {
  const response = await api.post('/login', credentials);
  return response.data;
};