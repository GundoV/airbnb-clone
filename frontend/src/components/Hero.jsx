import React from 'react';

export default function Hero() {
  const handleScrollToExplore = () => {
    const listingsSection = document.getElementById('listings-grid');
    if (listingsSection) {
      listingsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative bg-gray-900 text-white h-[380px] flex items-center justify-center overflow-hidden rounded-3xl mb-8 mx-4 sm:mx-6">
      <img
        src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200"
        alt="South African Coastal Beach"
        className="absolute inset-0 w-full h-full object-cover opacity-40 select-none"
      />

      <div className="relative z-10 text-center max-w-2xl px-6">
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 tracking-tight leading-tight">
          Find your next South African escape
        </h1>
        <p className="text-gray-200 text-base sm:text-lg mb-6 leading-relaxed">
          Discover unforgettable stays across South Africa — from vibrant city apartments to peaceful coastal retreats.
        </p>
        <button
          type="button"
          onClick={handleScrollToExplore}
          className="bg-[#FF385C] hover:bg-[#E00B41] text-white font-semibold px-8 py-3 rounded-full shadow-md hover:shadow-lg transition cursor-pointer active:scale-95"
        >
          Explore Stays
        </button>
      </div>
    </div>
  );
}