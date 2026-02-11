import React from 'react';
import { useAuth } from './contexts/AuthContext';
import { Routes, Route, Navigate } from 'react-router-dom';
import FarmerApp from './components/FarmerApp';
import AdminApp from './components/AdminApp';
import { LoginScreen } from './components/LoginScreen';

export default function App() {
  const { user } = useAuth();

  // Strict check for "admin" role from localStorage (set during login)
  // In a real app, this should be validated against the user's profile in DB
  const role = localStorage.getItem('agri_user_role') || 'farmer';

  return (
    <Routes>
      <Route path="/login" element={!user ? <LoginScreen /> : <Navigate to="/" />} />
      <Route
        path="/*"
        element={
          user ? (
            role === 'admin' ? <AdminApp /> : <FarmerApp />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
    </Routes>
  );
}
