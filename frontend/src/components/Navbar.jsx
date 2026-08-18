import React, { useState, useContext, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, User as UserIcon, LogOut, PlusCircle, Building2, Calendar } from 'lucide-react';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';

function Navbar() {
  const [showDropdown, setShowDropdown] = useState(false);
  const { user, logout, setUser } = useContext(AuthContext) || {};
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const isHostView = location.pathname.toLowerCase().startsWith('/host');

  const queryParams = new URLSearchParams(location.search);
  const activeCategory = queryParams.get('category');

  const token = localStorage.getItem('token');
  let storedUser = null;
  try {
    const item = localStorage.getItem('user');
    if (item && item !== 'undefined' && item !== 'null') {
      storedUser = JSON.parse(item);
    }
  } catch (err) {
    console.error('Failed to parse user from localStorage:', err);
  }

  const currentUser = user || storedUser;

  useEffect(() => {
    const processPendingBooking = async () => {
      const activeToken = localStorage.getItem('token');
      const pending = localStorage.getItem('pendingBooking');

      if (activeToken && pending) {
        try {
          const bookingData = JSON.parse(pending);
          await api.post('/reservations', {
            accommodationId: bookingData.listingId,
            listingId: bookingData.listingId,
            checkIn: bookingData.checkIn,
            checkOut: bookingData.checkOut,
            guests: Number(bookingData.guests),
            totalPrice: bookingData.totalPrice,
          });
          localStorage.removeItem('pendingBooking');
          navigate('/reservations');
        } catch (err) {
          console.error('Failed to auto-process pending booking:', err);
          localStorage.removeItem('pendingBooking');
        }
      }
    };

    processPendingBooking();
  }, [currentUser, navigate]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setShowDropdown(false);
    if (logout) {
      logout();
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (setUser) setUser(null);
      navigate('/login');
    }
  };

  const handleCategoryClick = (category) => {
    if (category === 'stays') {
      navigate('/');
    } else {
      navigate(`/?category=${encodeURIComponent(category)}`);
    }
  };

  const displayName = currentUser?.name || currentUser?.email || 'User';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <nav className="bg-gray-900 text-white px-6 py-3.5 flex justify-between items-center relative z-50 border-b border-gray-800">
      <Link to="/" className="flex items-center space-x-2 text-[#FF385C] font-bold text-xl">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 32 32"
          aria-hidden="true"
          role="presentation"
          focusable="false"
          className="block w-7 h-7 text-[#FF385C]"
          fill="currentColor"
        >
          <path d="M16 1c2.008 0 3.463.963 4.751 3.269l.533 1.025c1.954 3.83 6.114 12.54 7.1 14.836l.145.353c.667 1.591.91 2.472.96 3.396l.01.356c0 4.08-3.32 7.375-7.4 7.375-2.58 0-4.88-1.31-6.25-3.31-1.37 2-3.67 3.31-6.25 3.31-4.08 0-7.4-3.295-7.4-7.375l.01-.356c.05-.924.293-1.805.96-3.396l.145-.353c.986-2.296 5.146-11.006 7.1-14.836l.533-1.025C12.537 1.963 13.992 1 16 1zm0 4c-1.125 0-1.928.536-2.784 2.112l-.462.906c-1.806 3.555-5.88 11.83-6.794 13.954l-.11.284c-.452 1.08-.62 1.69-.65 2.348l-.004.246c0 1.865 1.51 3.375 3.375 3.375 1.95 0 3.75-1.1 4.5-2.85l.38-.95c.42-1.05 1.4-1.75 2.52-1.75s2.1.7 2.52 1.75l.38.95c.75 1.75 2.55 2.85 4.5 2.85 1.865 0 3.375-1.51 3.375-3.375l-.004-.246c-.03-.658-.198-1.268-.65-2.348l-.11-.284c-.914-2.124-4.988-10.4-6.794-13.954l-.462-.906C17.928 5.536 17.125 5 16 5zm0 10a4 4 0 110 8 4 4 0 010-8zm0 2a2 2 0 100 4 2 2 0 000-4z" />
        </svg>
        <span className="hidden sm:inline tracking-tight font-extrabold text-white text-lg">
          airbnb
        </span>
      </Link>

      <div className="hidden md:flex items-center space-x-8 text-xs font-semibold">
        <button
          type="button"
          onClick={() => handleCategoryClick('stays')}
          className={`cursor-pointer transition bg-transparent border-none ${
            !activeCategory
              ? 'text-white border-b-2 border-[#FF385C] pb-1'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Places to stay
        </button>
        <button
          type="button"
          onClick={() => handleCategoryClick('Experience')}
          className={`cursor-pointer transition bg-transparent border-none ${
            activeCategory === 'Experience'
              ? 'text-white border-b-2 border-[#FF385C] pb-1'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Experiences
        </button>
        <button
          type="button"
          onClick={() => handleCategoryClick('Online Experience')}
          className={`cursor-pointer transition bg-transparent border-none ${
            activeCategory === 'Online Experience'
              ? 'text-white border-b-2 border-[#FF385C] pb-1'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Online Experiences
        </button>
      </div>

      <div className="flex items-center space-x-3">
        {isHostView ? (
          <Link
            to="/"
            className="text-xs font-semibold text-gray-300 hover:text-white hover:bg-gray-800 px-3.5 py-2 rounded-full transition"
          >
            Switch to traveling
          </Link>
        ) : (
          <Link
            to={currentUser || token ? "/host/dashboard" : "/login"}
            className="text-xs font-semibold text-gray-300 hover:text-white hover:bg-gray-800 px-3.5 py-2 rounded-full transition"
          >
            Switch to hosting
          </Link>
        )}

        {currentUser || token ? (
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setShowDropdown((prev) => !prev)}
              className="flex items-center space-x-2 border border-gray-700 rounded-full pl-3 pr-1.5 py-1 bg-gray-800 text-white hover:border-gray-500 transition cursor-pointer"
            >
              <Menu className="w-4 h-4 text-gray-300" />
              <div className="w-7 h-7 bg-[#FF385C] text-white rounded-full flex items-center justify-center text-xs font-bold">
                {initial}
              </div>
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white text-gray-800 rounded-2xl shadow-2xl py-2 z-50 text-xs border border-gray-100">
                <div className="px-4 py-2.5 border-b border-gray-100">
                  <p className="font-bold text-gray-900 truncate">{displayName}</p>
                  {currentUser?.email && (
                    <p className="text-[11px] text-gray-500 truncate mt-0.5">{currentUser.email}</p>
                  )}
                </div>

                <div className="py-1">
                  <Link
                    to="/reservations"
                    className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-50 text-gray-700 font-medium"
                    onClick={() => setShowDropdown(false)}
                  >
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span>My Reservations</span>
                  </Link>
                  <Link
                    to="/host/dashboard"
                    className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-50 text-gray-700 font-medium"
                    onClick={() => setShowDropdown(false)}
                  >
                    <Building2 className="w-4 h-4 text-gray-500" />
                    <span>Host Dashboard</span>
                  </Link>
                  <Link
                    to="/create-listing"
                    className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-50 text-gray-700 font-medium"
                    onClick={() => setShowDropdown(false)}
                  >
                    <PlusCircle className="w-4 h-4 text-gray-500" />
                    <span>Create Listing</span>
                  </Link>
                </div>

                <hr className="my-1 border-gray-100" />

                <button
                  type="button"
                  className="flex items-center space-x-2 w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 font-medium cursor-pointer transition"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 text-red-600" />
                  <span>Log out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center space-x-3 text-xs font-semibold">
            <Link to="/login" className="hover:underline text-gray-300 hover:text-white px-2">
              Log in
            </Link>
            <Link
              to="/signup"
              className="bg-[#FF385C] hover:bg-[#E00B41] text-white px-4 py-2 rounded-full transition"
            >
              Sign up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;