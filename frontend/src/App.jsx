import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import AdminPortal from './pages/AdminPortal';
import SelectionHub from './pages/SelectionHub';
import Dashboard from './pages/Dashboard';

function ProtectedRoute({ children, reqRole, reqActiveClient }) {
  const { currentUser, activeClient } = useAuth();
  
  if (!currentUser) return <Navigate to="/login" replace />;
  if (reqRole && currentUser.role !== reqRole) {
    if (currentUser.role === 'admin') return <Navigate to="/admin" replace />;
    return <Navigate to="/reconciliation" replace />;
  }
  if (reqActiveClient && !activeClient) {
    // If Admin needs to have an active client but doesn't, boot to admin portal
    return <Navigate to="/admin" replace />;
  }
  
  return <Layout>{children}</Layout>;
}

function AppContent() {
  const { currentUser } = useAuth();

  return (
    <Routes>
      <Route 
        path="/" 
        element={
          currentUser 
            ? <Navigate to={currentUser.role === 'admin' ? '/admin' : '/selection'} replace /> 
            : <Navigate to="/login" replace />
        } 
      />
      
      <Route path="/login" element={<Login />} />
      
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute reqRole="admin">
            <AdminPortal />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/selection" 
        element={
          <ProtectedRoute reqActiveClient={true}>
            <SelectionHub />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/reconciliation" 
        element={
          <ProtectedRoute reqActiveClient={true}>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
