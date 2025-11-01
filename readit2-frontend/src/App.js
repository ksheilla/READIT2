import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import ReflectionPage from './pages/ReflectionPage';
import LeaderboardPage from './pages/LeaderboardPage';

function App() {
  const isAuthenticated = () => {
    return !!localStorage.getItem('readit2_user');
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        <Route 
          path="/home" 
          element={
            isAuthenticated() ? <HomePage /> : <Navigate to="/login" />
          } 
        />
        
        <Route 
          path="/reflect" 
          element={
            isAuthenticated() ? <ReflectionPage /> : <Navigate to="/login" />
          } 
        />
        
        <Route 
          path="/leaderboard" 
          element={
            isAuthenticated() ? <LeaderboardPage /> : <Navigate to="/login" />
          } 
        />
        
        <Route 
          path="/" 
          element={
            isAuthenticated() ? <Navigate to="/home" /> : <LoginPage />
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;