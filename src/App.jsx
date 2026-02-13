import React from 'react';
import { useAuth } from './contexts/AuthContext';
import { Routes, Route, Navigate } from 'react-router-dom';
import { FieldMapScreen } from './components/FieldMapScreen';
import AdminApp from './components/AdminApp';
import FarmerApp from './components/FarmerApp';
import { LoginScreen } from './components/LoginScreen';

export default function App() {
  const { user } = useAuth();
  const role = localStorage.getItem('agri_user_role') || 'farmer';

  return (
    <Routes>
      <Route path="/login" element={!user ? <LoginScreen /> : <Navigate to="/" />} />
      <Route path="/fields" element={user ? <FieldMapScreen /> : <Navigate to="/login" />} />
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
