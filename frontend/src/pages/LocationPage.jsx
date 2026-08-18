import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from '../api/axios';

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80';

export default function LocationPage() {
  const [accommodations, setAccommodations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();

  // Extract query parameters from URL
  const queryParams = new URLSearchParams(location.search);
  const selectedLocation = queryParams.get('location') || '';
  const selectedCategory = queryParams.get('category') || '';
  const selectedGuests = queryParams.get('guests') || '';

  // Local state for interactive top filter inputs
  const [filterLocation, setFilterLocation] = useState(selectedLocation);
  const [filterCategory, setFilterCategory] = useState(selectedCategory);

  // Keep local filter inputs synced if URL params change externally
  useEffect(() => {
    setFilterLocation(selectedLocation);
    setFilterCategory(selectedCategory);
  }, [selectedLocation, selectedCategory]);

  const fetchAccommodations = useCallback(async (isMounted = true) => {
    try {
      if (isMounted) {
        setLoading(true);
        setError(null);
      }

      // Fetch from API with current search parameters using centralized axios instance
      const response = await axios.get('/accommodations', {
        params: {
          location: selectedLocation,
          category: selectedCategory,
          guests: selectedGuests,
          t: Date.now(), // Cache-busting
        },
      });

      if (isMounted) {
        setAccommodations(Array.isArray(response.data) ? response.data : []);
      }
    } catch (err) {
      if (isMounted) {
        console.error('Error fetching location accommodations:', err);
        setError(err.response?.data?.message || 'Failed to load properties for this location. Please try again.');
      }
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }
  }, [selectedLocation, selectedCategory, selectedGuests]);

  useEffect(() => {
    let isMounted = true;
    fetchAccommodations(isMounted);
    return () => {
      isMounted = false;
    };
  }, [fetchAccommodations]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (filterLocation.trim()) params.set('location', filterLocation.trim());
    if (filterCategory) params.set('category', filterCategory);
    if (selectedGuests) params.set('guests', selectedGuests);

    navigate(`/locations?${params.toString()}`);
  };

  const getAccommodationImage = (item) => {
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-gray-900">
      {/* Top Filter Bar Header */}
      <div className="border-b border-gray-200 pb-6 mb-8">
        <form
          onSubmit={handleFilterSubmit}
          className="flex flex-wrap items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-200 shadow-sm"
        >
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
              Location
            </label>
            <input
              type="text"
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              placeholder="Where are you going?"
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div className="w-48">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
              Category
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer"
            >
              <option value="">All Categories</option>
              <option value="Entire apartment">Entire apartment</option>
              <option value="Experience">Experience</option>
              <option value="Online Experience">Online Experience</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="bg-rose-500 text-white px-6 py-2 rounded-lg font-semibold text-sm hover:bg-rose-600 transition cursor-pointer"
            >
              Update Filter
            </button>
          </div>
        </form>
      </div>

      {/* Heading & Accommodations Summary */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">
          {accommodations.length} accommodations {selectedLocation ? `for "${selectedLocation}"` : 'available'}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Review details and prices before booking your stay.
        </p>
      </div>

      {/* Loading & Error Indicators */}
      {loading && (
        <div className="text-center py-20 font-medium text-gray-500">
          Loading places to stay...
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 mb-6 text-sm font-medium">
          {error}
        </div>
      )}

      {/* Location Cards Container */}
      {!loading && !error && (
        <div className="space-y-6">
          {accommodations.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
              <h3 className="text-lg font-semibold text-gray-700">No accommodations found</h3>
              <p className="text-sm text-gray-500 mt-1">
                Try clearing or adjusting your filter settings.
              </p>
            </div>
          ) : (
            accommodations.map((item) => {
              const itemId = item._id || item.id;
              return (
                <Link
                  key={itemId}
                  to={`/listings/${itemId}`}
                  className="flex flex-col md:flex-row border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition bg-white group"
                >
                  {/* Image on Left */}
                  <div className="md:w-1/3 h-56 md:h-auto relative overflow-hidden bg-gray-100 flex-shrink-0">
                    <img
                      src={getAccommodationImage(item)}
                      alt={item.title || 'Accommodation'}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = DEFAULT_IMAGE;
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  </div>

                  {/* Details on Right */}
                  <div className="md:w-2/3 p-6 flex flex-col justify-between">
                    <div>
                      {/* Accommodation Type & Location */}
                      <div className="flex justify-between items-start text-xs text-gray-500 font-medium mb-1">
                        <span>
                          {item.type || 'Property'} in {item.location || 'South Africa'}
                        </span>
                        {/* Ratings */}
                        <div className="flex items-center space-x-1 text-xs text-gray-800">
                          <span>★</span>
                          <span className="font-bold">{item.rating || '4.8'}</span>
                          <span className="text-gray-400">({item.reviews || 0} reviews)</span>
                        </div>
                      </div>

                      {/* Title */}
                      <h2 className="text-xl font-bold text-gray-900 group-hover:text-rose-500 transition mb-2 truncate">
                        {item.title}
                      </h2>

                      <div className="w-12 h-0.5 bg-gray-200 my-3"></div>

                      {/* Details / Amenities */}
                      <p className="text-xs text-gray-500 mb-2">
                        {item.guests || 2} guests &bull; {item.bedrooms || 1} bedrooms &bull; {item.bathrooms || 1} baths
                      </p>

                      {Array.isArray(item.amenities) && item.amenities.length > 0 && (
                        <p className="text-xs text-gray-500 line-clamp-1">
                          {item.amenities.join(' · ')}
                        </p>
                      )}
                    </div>

                    {/* Price per night */}
                    <div className="flex justify-between items-end mt-4 pt-4 border-t border-gray-100">
                      <span className="text-xs text-gray-400">Self check-in available</span>
                      <div className="text-right">
                        <span className="text-lg font-extrabold text-gray-900">
                          R{Number(item.price || 0).toLocaleString()}
                        </span>
                        <span className="text-xs text-gray-500 font-medium"> / night</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}