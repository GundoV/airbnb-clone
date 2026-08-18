import React, { useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader2, Lock, Mail, User as UserIcon } from 'lucide-react';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';

function AuthPage() {
  // Toggle state between Login (true) and Sign Up (false)
  const [isLogin, setIsLogin] = useState(true);
  
  // Form input state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Retrieve auth context helper, router navigations, and previous location state
  const { login } = useContext(AuthContext) || {};
  const navigate = useNavigate();
  const location = useLocation();

  // Determine redirect target after successful authentication (defaults to home '/')
  const redirectPath = location.state?.from?.pathname || '/';

  // Handle form input changes dynamically
  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Handle user authentication submission (Login or Register)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isLogin ? '/auth/login' : '/auth/register';

    try {
      const payload = isLogin
        ? { email: formData.email, password: formData.password }
        : formData;

      const response = await api.post(endpoint, payload);
      
      // Extract authentication token and user profile data flexibly from typical API responses
      const token = response.data.token || response.data.jwt;
      const user = response.data.user || response.data.data?.user || response.data;

      if (!token) {
        throw new Error('No authentication token received from server.');
      }

      // Update global context state or fallback to local storage
      if (login) {
        login(user, token);
      } else {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
      }

      // Redirect user to their intended destination
      navigate(redirectPath, { replace: true });
    } catch (err) {
      console.error('Auth Error:', err);
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Authentication failed. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        {/* Header Title & Subtitle */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            {isLogin ? 'Log in to Airbnb' : 'Sign up for Airbnb'}
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            {isLogin ? 'Welcome back! Please enter your details.' : 'Create an account to start booking stays.'}
          </p>
        </div>

        {/* Error Alert Display */}
        {error && (
          <div className="mb-6 p-3.5 bg-red-50 border border-red-100 text-red-600 text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        {/* Main Authentication Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name Field (Sign Up Only) */}
          {!isLogin && (
            <div>
              <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required={!isLogin}
                  placeholder="John Doe"
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-black focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Email Address Field */}
          <div>
            <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-black focus:outline-none"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-black focus:outline-none"
              />
            </div>
          </div>

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#FF385C] hover:bg-[#E00B41] text-white font-bold rounded-xl text-xs transition cursor-pointer disabled:opacity-50 flex items-center justify-center space-x-2 border-none"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <span>{isLogin ? 'Log In' : 'Sign Up'}</span>
            )}
          </button>
        </form>

        {/* Mode Switcher Toggle (Login <-> Sign Up) */}
        <div className="mt-6 text-center text-xs border-t border-gray-100 pt-4">
          <button
            type="button"
            onClick={() => {
              setError('');
              setIsLogin(!isLogin);
            }}
            className="text-[#FF385C] hover:underline font-semibold cursor-pointer bg-transparent border-none"
          >
            {isLogin
              ? "Don't have an account? Sign up"
              : 'Already have an account? Log in'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;