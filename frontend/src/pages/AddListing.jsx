import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LayoutDashboard, Building2, PlusCircle, Image as ImageIcon, Loader2 } from 'lucide-react';
import api from '../api/axios';

// Default fallback image URL if no valid image is provided
const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=800&q=80';

function AddListing() {
  const navigate = useNavigate();
  
  // Local form state for listing details
  const [formData, setFormData] = useState({
    title: '',
    city: 'Cape Town',
    accommodationType: 'Apartment',
    description: '',
    guests: 1,
    bedrooms: 1,
    bathrooms: 1,
    price: '',
    imageUrl: '',
  });
  
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Handle input field changes dynamically
  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
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

  // Handle form submission and send data to backend API
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);

    const finalImageUrl = formData.imageUrl.trim() ? formData.imageUrl.trim() : DEFAULT_IMAGE;

    try {
      await api.post('/listings', {
        title: formData.title.trim(),
        description: formData.description.trim(),
        city: formData.city,
        location: formData.city,
        accommodationType: formData.accommodationType,
        category: formData.accommodationType,
        price: Number(formData.price),
        guests: Number(formData.guests),
        bedrooms: Number(formData.bedrooms),
        bathrooms: Number(formData.bathrooms),
        imageUrl: finalImageUrl,
        image: finalImageUrl,
        images: [finalImageUrl],
      });
      
      // Redirect to host dashboard upon successful creation
      navigate('/host/dashboard');
    } catch (err) {
      console.error('Failed to add listing:', err);
      setError(err.response?.data?.message || 'Failed to add listing. Please verify your inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row gap-10">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 flex-shrink-0 space-y-4 text-xs font-semibold">
        <h2 className="text-lg font-bold text-gray-900 mb-4 px-2">Host Portal</h2>
        <nav className="flex flex-col space-y-1">
          <Link
            to="/host/dashboard"
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-2.5 rounded-xl transition"
          >
            <LayoutDashboard className="w-4 h-4 text-gray-500" />
            <span>Dashboard</span>
          </Link>
          <Link
            to="/host/dashboard"
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-2.5 rounded-xl transition"
          >
            <Building2 className="w-4 h-4 text-gray-500" />
            <span>My Listings</span>
          </Link>
          <Link
            to="/host/add-listing"
            className="flex items-center space-x-2 text-[#FF385C] bg-rose-50 font-bold px-3 py-2.5 rounded-xl transition"
          >
            <PlusCircle className="w-4 h-4 text-[#FF385C]" />
            <span>Add Listing</span>
          </Link>
        </nav>
      </aside>

      {/* Main Form Content */}
      <main className="flex-1 max-w-2xl bg-white p-8 border border-gray-100 rounded-2xl shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Add New Listing</h1>
        <p className="text-gray-500 text-xs mb-6">
          Provide details about your accommodation to publish it live.
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
              Listing Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Modern Sunset Apartment in Sea Point"
              className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black text-xs"
              required
            />
          </div>

          {/* City & Accommodation Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                City *
              </label>
              <select
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full p-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-black text-xs"
              >
                <option value="Cape Town">Cape Town</option>
                <option value="Johannesburg">Johannesburg</option>
                <option value="Durban">Durban</option>
                <option value="Pretoria">Pretoria</option>
                <option value="Knysna">Knysna</option>
                <option value="Bela-Bela">Bela-Bela</option>
                <option value="Midrand">Midrand</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                Property Type *
              </label>
              <select
                name="accommodationType"
                value={formData.accommodationType}
                onChange={handleChange}
                className="w-full p-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-black text-xs"
              >
                <option value="Apartment">Apartment</option>
                <option value="House">House</option>
                <option value="Villa">Villa</option>
                <option value="Cabin">Cabin</option>
                <option value="Studio">Studio</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
              Description *
            </label>
            <textarea
              name="description"
              rows="4"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the property, surrounding area, and amenities..."
              className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black text-xs"
              required
            ></textarea>
          </div>

          {/* Guest and Room Capacity */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                Guests
              </label>
              <input
                type="number"
                name="guests"
                min="1"
                value={formData.guests}
                onChange={handleChange}
                className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                Bedrooms
              </label>
              <input
                type="number"
                name="bedrooms"
                min="1"
                value={formData.bedrooms}
                onChange={handleChange}
                className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                Bathrooms
              </label>
              <input
                type="number"
                name="bathrooms"
                min="1"
                value={formData.bathrooms}
                onChange={handleChange}
                className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black text-xs"
              />
            </div>
          </div>

          {/* Price */}
          <div>
            <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
              Price per night (ZAR) *
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="e.g. 1200"
              min="1"
              className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black text-xs"
              required
            />
          </div>

          {/* Image URL with Real-time Preview */}
          <div>
            <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
              Image URL
            </label>
            <input
              type="text"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              placeholder="https://images.unsplash.com/..."
              className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black text-xs mb-3"
            />
            {formData.imageUrl.trim() && (
              <div className="w-full h-40 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 flex items-center justify-center">
                <img
                  src={formData.imageUrl.trim()}
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

          {/* Form Controls */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate('/host/dashboard')}
              className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-xs transition cursor-pointer border-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center space-x-2 px-6 py-2.5 bg-[#FF385C] hover:bg-[#E00B41] text-white font-bold rounded-xl text-xs transition cursor-pointer border-none disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Publishing...</span>
                </>
              ) : (
                <span>Add Listing</span>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default AddListing;