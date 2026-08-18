import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useContext(AuthContext) || {};
  const location = useLocation();

  const token = localStorage.getItem('token');

  // Display a loading spinner while authentication state is being verified
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-[#FF385C] rounded-full animate-spin" />
      </div>
    );
  }

  // Redirect unauthenticated users to the login page while preserving current location state
  if (!user && !token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Render the protected child component if authenticated
  return children;
}