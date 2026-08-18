import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Image as ImageIcon } from 'lucide-react';
import api from '../api/axios';

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=800&q=80';

export default function CreateListingPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    description: '',
    price: '',
    guests: '2',
    bedrooms: '1',
    bathrooms: '1',
    image: '',
    category: 'Apartments',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const parsedPrice = Number(formData.price);

    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setError('Please enter a valid numeric price per night.');
      setLoading(false);
      return;
    }

    const finalImage = formData.image.trim() ? formData.image.trim() : DEFAULT_IMAGE;

    const payload = {
      title: formData.title.trim(),
      location: formData.location.trim(),
      city: formData.location.split(',')[0].trim(),
      description: formData.description.trim(),
      price: parsedPrice,
      pricePerNight: parsedPrice,
      guests: Number(formData.guests) || 1,
      bedrooms: Number(formData.bedrooms) || 1,
      bathrooms: Number(formData.bathrooms) || 1,
      image: finalImage,
      imageUrl: finalImage,
      images: [finalImage],
      category: formData.category,
      accommodationType: formData.category,
    };

    try {
      await api.post('/listings', payload);
      setLoading(false);
      navigate('/host/dashboard');
    } catch (err) {
      console.error('Submission error:', err.response?.data);
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          'Failed to create listing. Please verify your entries.'
      );
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Host Your Space on Airbnb</h1>
        <p className="text-xs text-gray-500 mt-1">
          Fill in the details below to publish your property live on the platform.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-xs rounded-xl font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
            Listing Title *
          </label>
          <input
            type="text"
            name="title"
            required
            placeholder="e.g. Modern Luxury Apartment in Cape Town"
            value={formData.title}
            onChange={handleChange}
            className="w-full border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-xl p-3 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="Apartments">Apartments</option>
              <option value="Houses">Houses</option>
              <option value="Villas">Villas</option>
              <option value="Cabins">Cabins</option>
              <option value="Studios">Studios</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
              Location *
            </label>
            <input
              type="text"
              name="location"
              required
              placeholder="e.g. Cape Town, South Africa"
              value={formData.location}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
            Price per Night (ZAR) *
          </label>
          <input
            type="number"
            name="price"
            required
            min="1"
            placeholder="e.g. 1200"
            value={formData.price}
            onChange={handleChange}
            className="w-full border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
              Max Guests
            </label>
            <input
              type="number"
              name="guests"
              min="1"
              value={formData.guests}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-black"
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
              className="w-full border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-black"
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
              className="w-full border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
            Image URL
          </label>
          <input
            type="url"
            name="image"
            placeholder="https://images.unsplash.com/..."
            value={formData.image}
            onChange={handleChange}
            className="w-full border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-black mb-3"
          />
          {formData.image.trim() && (
            <div className="w-full h-40 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 flex items-center justify-center">
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

        <div>
          <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
            Description *
          </label>
          <textarea
            name="description"
            rows="4"
            required
            placeholder="Provide a vivid description of your place..."
            value={formData.description}
            onChange={handleChange}
            className="w-full border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-black"
          ></textarea>
        </div>

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
            disabled={loading}
            className="flex items-center space-x-2 px-6 py-2.5 bg-[#FF385C] hover:bg-[#E00B41] text-white font-bold rounded-xl text-xs transition cursor-pointer border-none disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Publishing...</span>
              </>
            ) : (
              <span>Publish Listing</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}