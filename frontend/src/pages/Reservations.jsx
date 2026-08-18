import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../api/axios';

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80';

const Reservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const navigate = useNavigate();

  const fetchReservations = useCallback(async (isMounted = true) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      if (isMounted) {
        setLoading(true);
        setError('');
      }

      // Try primary reservations endpoint using centralized axios instance
      const res = await axios.get('/reservations/user', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (isMounted) {
        setReservations(Array.isArray(res.data) ? res.data : []);
      }
    } catch (err) {
      console.error('Failed to fetch reservations from /reservations/user, trying fallback:', err);
      // Fallback route attempt in case backend uses /bookings instead of /reservations
      try {
        const currentToken = localStorage.getItem('token');
        const fallbackRes = await axios.get('/bookings/my-bookings', {
          headers: { Authorization: `Bearer ${currentToken}` },
        });
        
        if (isMounted) {
          setReservations(Array.isArray(fallbackRes.data) ? fallbackRes.data : []);
        }
      } catch (fallbackErr) {
        if (isMounted) {
          setError(
            fallbackErr.response?.data?.message ||
              err.response?.data?.message ||
              'Failed to fetch reservations.'
          );
        }
      }
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }
  }, [navigate]);

  useEffect(() => {
    let isMounted = true;
    fetchReservations(isMounted);
    return () => {
      isMounted = false;
    };
  }, [fetchReservations]);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this reservation?')) return;

    try {
      const token = localStorage.getItem('token');
      // Attempt deleting from /reservations first; if backend uses /bookings, handle or adjust if needed
      await axios.delete(`/reservations/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Optimistic update to avoid extra network request
      setReservations((prev) => prev.filter((res) => (res._id || res.id) !== id));
    } catch (err) {
      console.error('Failed to cancel reservation:', err);
      // Fallback delete route if primary uses /bookings
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/bookings/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReservations((prev) => prev.filter((res) => (res._id || res.id) !== id));
      } catch (fallbackDeleteErr) {
        alert(
          fallbackDeleteErr.response?.data?.message ||
            err.response?.data?.message ||
            'Failed to cancel reservation.'
        );
      }
    }
  };

  const getReservationImage = (listing) => {
    if (Array.isArray(listing.images) && listing.images.length > 0 && listing.images[0]) {
      return listing.images[0];
    }
    if (listing.image && typeof listing.image === 'string' && listing.image.trim() !== '') {
      return listing.image;
    }
    if (listing.imageUrl && typeof listing.imageUrl === 'string' && listing.imageUrl.trim() !== '') {
      return listing.imageUrl;
    }
    return DEFAULT_IMAGE;
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-gray-500 font-medium">
        Loading your reservations...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 text-gray-900">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Your Reservations</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and track your upcoming stays</p>
        </div>

        {/* View Switcher */}
        {reservations.length > 0 && (
          <div className="flex border border-gray-300 rounded-lg overflow-hidden text-xs font-semibold">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 cursor-pointer transition ${
                viewMode === 'grid' ? 'bg-black text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Cards
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 cursor-pointer transition ${
                viewMode === 'table' ? 'bg-black text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Table
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl mb-6 text-sm font-semibold border border-red-200">
          {error}
        </div>
      )}

      {reservations.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-800">No reservations found</h3>
          <p className="text-sm text-gray-500 mt-1 mb-4">You haven't booked any stays yet.</p>
          <Link
            to="/"
            className="inline-block bg-[#FF385C] hover:bg-[#E00B41] text-white font-medium text-sm px-5 py-2.5 rounded-xl transition"
          >
            Explore Listings
          </Link>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reservations.map((res) => {
            const listing = res.listing || res.accommodationId || {};
            const resId = res._id || res.id;
            const imageSrc = getReservationImage(listing);

            return (
              <div
                key={resId}
                className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition bg-white flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-48 w-full bg-gray-100 overflow-hidden">
                    <img
                      src={imageSrc}
                      alt={listing.title || 'Listing'}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = DEFAULT_IMAGE;
                      }}
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {listing.title || 'Listing'}
                    </h3>
                    <p className="text-gray-500 text-sm mb-4 truncate">
                      {listing.location || listing.city || 'Location details unavailable'}
                    </p>

                    <div className="bg-gray-50 p-3 rounded-xl text-xs space-y-1.5 border border-gray-100">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Check-in:</span>
                        <span className="font-medium text-gray-800">
                          {res.checkIn ? new Date(res.checkIn).toLocaleDateString('en-ZA') : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Checkout:</span>
                        <span className="font-medium text-gray-800">
                          {res.checkOut ? new Date(res.checkOut).toLocaleDateString('en-ZA') : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Guests:</span>
                        <span className="font-medium text-gray-800">
                          {res.guests || res.numberOfGuests || 1}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0 flex justify-between items-center">
                  <span className="font-bold text-lg text-gray-900">
                    R{Number(res.totalPrice || 0).toLocaleString()}
                  </span>
                  <button
                    onClick={() => handleCancel(resId)}
                    className="border border-red-500 text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer"
                  >
                    Cancel Stay
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="overflow-x-auto border border-gray-200 rounded-2xl bg-white shadow-sm">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold uppercase text-gray-500">
                <th className="py-3 px-4">Listing</th>
                <th className="py-3 px-4">Check-in</th>
                <th className="py-3 px-4">Checkout</th>
                <th className="py-3 px-4 text-center">Guests</th>
                <th className="py-3 px-4 text-right">Total</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reservations.map((res) => {
                const listing = res.listing || res.accommodationId || {};
                const resId = res._id || res.id;

                return (
                  <tr key={resId} className="hover:bg-gray-50/50 transition">
                    <td className="py-3 px-4 font-semibold text-gray-900 truncate max-w-xs">
                      {listing.title || 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {res.checkIn ? new Date(res.checkIn).toLocaleDateString('en-ZA') : 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {res.checkOut ? new Date(res.checkOut).toLocaleDateString('en-ZA') : 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-center text-gray-600">
                      {res.guests || res.numberOfGuests || 1}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-gray-900">
                      R{Number(res.totalPrice || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleCancel(resId)}
                        className="text-xs text-red-600 hover:bg-red-50 border border-red-200 px-3 py-1 rounded-lg transition cursor-pointer font-medium"
                      >
                        Cancel
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Reservations;