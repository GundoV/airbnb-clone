import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Heart } from 'lucide-react';

export default function ListingCard({ listing, isHost, onDelete }) {
  const [isLiked, setIsLiked] = useState(false);

  if (!listing) return null;

  const id = listing._id || listing.id;

  const displayImage =
    Array.isArray(listing.images) && listing.images.length > 0
      ? listing.images[0]
      : listing.image || listing.imageUrl || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600';

  const toggleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  return (
    <div className="group border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 bg-white flex flex-col justify-between">
      <div>
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <Link to={`/listing/${id}`}>
            <img
              src={displayImage}
              alt={listing.title || 'Listing'}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-500 ease-out"
            />
          </Link>

          {!isHost && (
            <button
              type="button"
              onClick={toggleFavorite}
              className="absolute top-3 right-3 p-2 rounded-full hover:bg-white/20 transition cursor-pointer z-10"
            >
              <Heart
                className={`w-5 h-5 transition ${
                  isLiked ? 'fill-[#FF385C] text-[#FF385C]' : 'text-white drop-shadow-md'
                }`}
              />
            </button>
          )}
        </div>

        <div className="p-4">
          <div className="flex justify-between items-start mb-1">
            <h3 className="font-semibold text-base text-gray-900 truncate pr-2">
              {listing.title || 'Untitled Stay'}
            </h3>
            <div className="flex items-center space-x-1 text-xs font-semibold shrink-0">
              <Star className="w-3.5 h-3.5 fill-black text-black" />
              <span>{listing.rating || '4.8'}</span>
            </div>
          </div>

          <p className="text-gray-500 text-xs truncate mb-2">
            {listing.location || 'Location not specified'}
          </p>

          <div className="text-gray-900 text-sm font-semibold">
            <span>R{listing.price?.toLocaleString() || '0'}</span>
            <span className="font-normal text-gray-500 text-xs"> / night</span>
          </div>
        </div>
      </div>

      <div className="px-4 pb-4 pt-1">
        {isHost ? (
          <div className="flex gap-2">
            <Link
              to={`/host/edit/${id}`}
              className="flex-1 text-center bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 rounded-xl text-xs transition"
            >
              Edit
            </Link>
            <button
              type="button"
              onClick={() => onDelete && onDelete(id)}
              className="bg-red-50 hover:bg-red-100 text-red-600 font-medium px-4 py-2 rounded-xl text-xs transition cursor-pointer"
            >
              Delete
            </button>
          </div>
        ) : (
          <Link
            to={`/listing/${id}`}
            className="block w-full text-center bg-[#FF385C] hover:bg-[#E00B41] text-white font-medium py-2.5 rounded-xl text-xs transition shadow-sm"
          >
            View Details
          </Link>
        )}
      </div>
    </div>
  );
}