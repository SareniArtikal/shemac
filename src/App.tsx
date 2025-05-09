import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import ToursPage from './pages/ToursPage';
import AdminLayout from './components/admin/AdminLayout';
import AdminLogin from './pages/admin/AdminLoginPage';
import AdminSettings from './pages/admin/AdminSettingsPage';
import AdminTours from './pages/admin/AdminToursPage';
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/tours" replace />} />
        <Route path="tours" element={<ToursPage />} />
      </Route>
      
      <Route path="/admin/login" element={<AdminLogin />} />
      
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/settings" replace />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="tours" element={<AdminTours />} />
      </Route>
    </Routes>
  );
}

export default App;