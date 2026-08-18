import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../api/axios';

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80';

export default function HostDashboard() {
  const [myListings, setMyListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Fetch host listings with cache-busting timestamp
  const fetchListings = useCallback(async (isMounted = true) => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`/listings?t=${Date.now()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (isMounted) {
        setMyListings(Array.isArray(res.data) ? res.data : []);
      }
    } catch (err) {
      if (isMounted) {
        console.error('Error loading host listings:', err);
        setError(err.response?.data?.message || 'Failed to retrieve listings.');
      }
    } finally {
      if (isMounted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    fetchListings(isMounted);
    return () => {
      isMounted = false;
    };
  }, [fetchListings]);

  // Fallback image resolver
  const getListingImage = (item) => {
    if (item?.image && typeof item.image === 'string' && item.image.trim() !== '') {
      return item.image;
    }
    if (item?.imageUrl && typeof item.imageUrl === 'string' && item.imageUrl.trim() !== '') {
      return item.imageUrl;
    }
    if (Array.isArray(item?.images) && item.images.length > 0 && item.images[0]) {
      return item.images[0];
    }
    return DEFAULT_IMAGE;
  };

  // Optimistic UI deletion handler
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;

    const previousListings = [...myListings];
    setMyListings((prev) => prev.filter((item) => item._id !== id));
    setDeletingId(id);

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/listings/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error('Failed to delete listing:', err);
      setMyListings(previousListings);
      alert(err.response?.data?.message || 'Failed to delete listing.');
    } finally {
      setDeletingId(null);
    }
  };

  // Safe metric calculations
  const totalListings = myListings.length;
  const totalValue = myListings.reduce((sum, item) => {
    const val = Number(item.price);
    return sum + (isNaN(val) ? 0 : val);
  }, 0);
  const avgPrice = totalListings > 0 ? Math.round(totalValue / totalListings) : 0;

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 bg-white min-h-screen text-gray-900">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Host Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your properties and review performance metrics.</p>
        </div>
        <Link
          to="/host/add-listing"
          className="bg-rose-500 hover:bg-rose-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition shadow-md cursor-pointer"
        >
          + Create New Listing
        </Link>
      </div>

      {/* Error Notice */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm rounded-xl border border-red-200 font-medium">
          {error}
        </div>
      )}

      {/* Analytics Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Properties Listed</p>
          <p className="text-3xl font-extrabold text-gray-900 mt-2">{totalListings}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Combined Rate / Night</p>
          <p className="text-3xl font-extrabold text-gray-900 mt-2">R{totalValue.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Average Nightly Rate</p>
          <p className="text-3xl font-extrabold text-gray-900 mt-2">R{avgPrice.toLocaleString()}</p>
        </div>
      </div>

      {/* Dynamic Content Feed */}
      {loading ? (
        <div className="text-center py-16">
          <p className="text-gray-500 font-medium text-sm">Loading your listings...</p>
        </div>
      ) : myListings.length === 0 ? (
        <div className="bg-gray-50 border border-dashed border-gray-300 rounded-3xl p-16 text-center">
          <p className="text-gray-700 mb-4 font-semibold text-base">You haven't published any listings yet.</p>
          <Link
            to="/host/add-listing"
            className="inline-block bg-rose-500 hover:bg-rose-600 text-white font-semibold px-6 py-3 rounded-xl text-xs transition shadow-md"
          >
            Create your first listing
          </Link>
        </div>
      ) : (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-6">Your Published Properties</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {myListings.map((item) => (
              <div
                key={item._id}
                className="border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition flex flex-col"
              >
                <div className="w-full h-48 bg-gray-100 overflow-hidden relative">
                  <img
                    src={getListingImage(item)}
                    alt={item.title || 'Property listing'}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = DEFAULT_IMAGE;
                    }}
                    className="w-full h-full object-cover"
                  />
                  {item.category && (
                    <span className="absolute top-3 left-3 bg-black/70 backdrop-blur-md text-white text-[10px] px-2.5 py-1 rounded-md font-bold uppercase tracking-wider">
                      {item.category}
                    </span>
                  )}
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 truncate text-base">{item.title}</h3>
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      {item.location || item.city || 'Location unavailable'}
                    </p>
                  </div>

                  <p className="mt-3 text-sm font-bold text-gray-900">
                    R{Number(item.price || 0).toLocaleString()}{' '}
                    <span className="font-normal text-xs text-gray-500">/ night</span>
                  </p>

                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => navigate(`/host/edit-listing/${item._id}`)}
                      className="flex-1 py-2 px-3 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition text-center cursor-pointer border-none"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      disabled={deletingId === item._id}
                      onClick={() => handleDelete(item._id)}
                      className="py-2 px-3 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 disabled:opacity-50 rounded-xl transition cursor-pointer border-none"
                    >
                      {deletingId === item._id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}