import React, { useState } from 'react';
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
import FoodMedia from './pages/FoodMedia';

const App = () => {
  const [showFoodMedia, setShowFoodMedia] = useState(false);

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
            <Route path="/" element={<Homepage onFoodMedia={() => setShowFoodMedia(true)} />} />
            <Route path="/log" element={<LogFoodPage onFoodMedia={() => setShowFoodMedia(true)} />} />
            <Route path="/history" element={<HistoryPage onFoodMedia={() => setShowFoodMedia(true)} />} />
            <Route path="/profile" element={<ProfilePage onFoodMedia={() => setShowFoodMedia(true)} />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
        <FeedbackModal />
        {showFoodMedia && <FoodMedia onClose={() => setShowFoodMedia(false)} />}
      </Router>
    </ThemeProvider>
  );
};

export default App;

