import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from '../api/axios';

// Default fallback image URL if no valid image is provided
const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=800&q=80';

export default function EditListing() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Local form state for listing fields
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    price: '',
    image: '',
    guests: 1,
    bedrooms: 1,
    bathrooms: 1,
    category: 'Apartments',
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Fetch existing listing details on component mount
  useEffect(() => {
    const fetchListing = async () => {
      try {
        const res = await axios.get(`/listings/${id}`);
        const data = res.data;

        // Populate form state, handling multiple API data conventions gracefully
        setFormData({
          title: data.title || '',
          description: data.description || '',
          location: data.location || data.city || '',
          price: data.price || data.pricePerNight || '',
          image: data.image || data.imageUrl || (data.images && data.images[0]) || '',
          guests: data.guests || 1,
          bedrooms: data.bedrooms || 1,
          bathrooms: data.bathrooms || 1,
          category: data.category || data.accommodationType || 'Apartments',
        });
      } catch (err) {
        console.error('Failed to load listing:', err);
        setError('Could not fetch listing details.');
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  // Handle input field changes dynamically
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Validate form inputs prior to submission
  const validateForm = () => {
    if (!formData.title.trim()) return 'Listing title is required.';
    if (!formData.description.trim()) return 'Description is required.';
    if (!formData.price || Number(formData.price) <= 0 || isNaN(formData.price)) {
      return 'Price per night must be a valid positive number.';
    }
    return null;
  };

  // Handle form submission and update listing data via API
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);

    const finalImage = formData.image.trim() ? formData.image.trim() : DEFAULT_IMAGE;
    const token = localStorage.getItem('token');

    // Build payload mapping variations to match multiple backend schema conventions
    const payload = {
      ...formData,
      title: formData.title.trim(),
      description: formData.description.trim(),
      location: formData.location.trim(),
      city: formData.location.trim(),
      price: Number(formData.price),
      pricePerNight: Number(formData.price),
      guests: Number(formData.guests),
      bedrooms: Number(formData.bedrooms),
      bathrooms: Number(formData.bathrooms),
      image: finalImage,
      imageUrl: finalImage,
      images: [finalImage],
    };

    try {
      await axios.put(`/listings/${id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Redirect back to host dashboard on success
      navigate('/host/dashboard');
    } catch (err) {
      console.error('Failed to update listing:', err);
      setError(err.response?.data?.message || 'Failed to update listing.');
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state display
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-20 text-center text-gray-500 font-medium">
        Loading listing details...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row gap-10">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 flex-shrink-0 space-y-4 text-sm font-semibold">
        <h2 className="text-xl font-bold mb-4 text-gray-900">Host Dashboard</h2>
        <nav className="flex flex-col space-y-2">
          <Link to="/host/dashboard" className="text-gray-600 hover:text-black py-1 transition">
            Dashboard
          </Link>
          <Link to="/host/dashboard" className="text-gray-600 hover:text-black py-1 transition">
            My Listings
          </Link>
          <Link to="/host/add-listing" className="text-gray-600 hover:text-black py-1 transition">
            Add Listing
          </Link>
        </nav>
      </aside>

      {/* Main Edit Form Content */}
      <main className="flex-1 max-w-2xl bg-white p-8 border border-gray-200 rounded-2xl shadow-sm">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Listing</h1>
        <p className="text-gray-500 text-sm mb-6">Update property information and pricing.</p>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm font-semibold border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-black text-sm"
            />
          </div>

          {/* Location and Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                Location / City *
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-black text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                Category / Type
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full border border-gray-300 p-3 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-black text-sm"
              >
                <option value="Apartments">Apartments</option>
                <option value="House">House</option>
                <option value="Villa">Villa</option>
                <option value="Cabin">Cabin</option>
                <option value="Studio">Studio</option>
              </select>
            </div>
          </div>

          {/* Price */}
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
              Price per Night (ZAR) *
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              min="1"
              required
              className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-black text-sm"
            />
          </div>

          {/* Image URL & Live Preview */}
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
              Image URL
            </label>
            <input
              type="text"
              name="image"
              value={formData.image}
              onChange={handleChange}
              placeholder="https://images.unsplash.com/..."
              className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-black text-sm mb-3"
            />
            {formData.image.trim() && (
              <div className="w-full h-36 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                <img
                  src={formData.image.trim()}
                  alt="Preview"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = DEFAULT_IMAGE;
                  }}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              required
              className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-black text-sm"
            />
          </div>

          {/* Guest and Room Capacities */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                Guests
              </label>
              <input
                type="number"
                name="guests"
                min="1"
                value={formData.guests}
                onChange={handleChange}
                className="w-full border border-gray-300 p-3 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                Bedrooms
              </label>
              <input
                type="number"
                name="bedrooms"
                min="1"
                value={formData.bedrooms}
                onChange={handleChange}
                className="w-full border border-gray-300 p-3 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                Bathrooms
              </label>
              <input
                type="number"
                name="bathrooms"
                min="1"
                value={formData.bathrooms}
                onChange={handleChange}
                className="w-full border border-gray-300 p-3 rounded-xl text-sm"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/host/dashboard')}
              className="px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-sm transition cursor-pointer border-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 bg-[#FF385C] hover:bg-[#E00B41] text-white font-bold rounded-xl text-sm transition cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}