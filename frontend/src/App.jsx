import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ListingDetails from './pages/ListingDetails';
import Reservations from './pages/Reservations';
import CreateListingPage from './pages/CreateListingPage';
import HostDashboard from './pages/HostDashboard';
import EditListing from './pages/EditListing';
import AuthPage from './pages/AuthPage';
import LocationPage from './pages/LocationPage';
import { AuthProvider } from './context/AuthContext';

// Safe route wrapper using localStorage directly
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col justify-between bg-white text-gray-900 font-sans antialiased">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            {/* Public / Guest Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/listing/:id" element={<ListingDetails />} />
            <Route path="/listings/:id" element={<ListingDetails />} />
            <Route path="/login" element={<AuthPage />} />
            <Route path="/register" element={<AuthPage />} />
            <Route path="/locations" element={<LocationPage />} />

            {/* Authenticated Guest Routes */}
            <Route
              path="/reservations"
              element={
                <ProtectedRoute>
                  <Reservations />
                </ProtectedRoute>
              }
            />

            {/* Host & Management Routes */}
            <Route
              path="/create-listing"
              element={
                <ProtectedRoute>
                  <CreateListingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/host/add-listing"
              element={
                <ProtectedRoute>
                  <CreateListingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/host/dashboard"
              element={
                <ProtectedRoute>
                  <HostDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/host/edit/:id"
              element={
                <ProtectedRoute>
                  <EditListing />
                </ProtectedRoute>
              }
            />
            <Route
              path="/host/edit-listing/:id"
              element={
                <ProtectedRoute>
                  <EditListing />
                </ProtectedRoute>
              }
            />

            {/* Fallback Route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
}