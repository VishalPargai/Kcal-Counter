import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';
import Loginpage from './pages/Loginpage';
import Homepage from './pages/Homepage';
import LogFoodPage from './pages/LogFoodPage';
import HistoryPage from './pages/HistoryPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboard from './pages/AdminDashboard';
import FeedbackModal from './components/FeedbackModal';

const App = () => {
  return (
    <ThemeProvider>
      <Toaster 
        position="top-center" 
        toastOptions={{
          style: {
            background: '#333',
            color: '#fff',
            borderRadius: '16px',
            fontSize: '14px',
            fontWeight: '600',
          },
        }} 
      />
      <Router>
        <div className="min-h-screen">
          <Routes>
            <Route path="/login" element={<Loginpage />} />
            <Route path="/" element={<Homepage />} />
            <Route path="/log" element={<LogFoodPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
        <FeedbackModal />
      </Router>
    </ThemeProvider>
  );
};

export default App;
