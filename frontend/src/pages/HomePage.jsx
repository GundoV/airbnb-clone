import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const DEFAULT_LISTING_IMG =
  'https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=800&q=80';

const EXPERIENCE_CARDS = [
  {
    id: 1,
    title: 'Things to do on your trip',
    subtitle: 'Find local activities, guided tours, and unique adventures.',
    buttonText: 'Experiences',
    category: 'Experience',
    image:
      'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: 2,
    title: 'Things to do at home',
    subtitle:
      'Connect with hosts worldwide through live, interactive online activities.',
    buttonText: 'Online Experiences',
    category: 'Online Experience',
    image:
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1000&q=80',
  },
];

const INSPIRATION_LOCATIONS = [
  {
    id: 1,
    city: 'Cape Town',
    distance: '4-hour flight / drive',
    image:
      'https://www.news.uct.ac.za/images/archive/dailynews/2015/CapeTownMountain_700.jpg',
    color: 'bg-pink-600',
  },
  {
    id: 2,
    city: 'Johannesburg',
    distance: '45-minute drive',
    image:
      'https://cdn.discoverafrica.com/wp-content/uploads/2025/04/10162858/Johannesburg-city-skyline-at-sunset.jpg',
    color: 'bg-red-500',
  },
  {
    id: 3,
    city: 'Durban',
    distance: '6-hour drive',
    image:
      'https://cdn.sanity.io/images/rd0y3pad/blog-production/65c188b1063537cdf61cafe390a6790e47b0c7b2-5616x3744.jpg?w=1200&q=75&auto=format',
    color: 'bg-blue-600',
  },
  {
    id: 4,
    city: 'Pretoria',
    distance: '30-minute drive',
    image:
      'https://media.istockphoto.com/id/625889358/photo/the-union-buildings-in-pretoria-south-africa.jpg?s=612x612&w=0&k=20&c=Ly0pYPE0p2Ld5wPmPuBgpHJ9Y7fBntaHL3W7M6qyyEE=',
    color: 'bg-emerald-600',
  },
];

const FUTURE_GETAWAYS = {
  'Arts & Culture': [
    { name: 'Phoenix', category: 'Arizona' },
    { name: 'Hot Springs', category: 'Arkansas' },
    { name: 'Los Angeles', category: 'California' },
    { name: 'San Diego', category: 'California' },
    { name: 'San Francisco', category: 'California' },
    { name: 'Barcelona', category: 'Spain' },
    { name: 'Prague', category: 'Czechia' },
    { name: 'Washington', category: 'District of Columbia' },
  ],
  'Outdoor Adventure': [
    { name: 'Lake Tahoe', category: 'California' },
    { name: 'Banff', category: 'Canada' },
    { name: 'Drakensberg', category: 'South Africa' },
    { name: 'Kruger National Park', category: 'South Africa' },
    { name: 'Queenstown', category: 'New Zealand' },
    { name: 'Moab', category: 'Utah' },
    { name: 'Sedona', category: 'Arizona' },
    { name: 'Chamonix', category: 'France' },
  ],
  Beach: [
    { name: 'Ballito', category: 'KwaZulu-Natal' },
    { name: 'Camps Bay', category: 'Western Cape' },
    { name: 'Umhlanga', category: 'KwaZulu-Natal' },
    { name: 'Miami', category: 'Florida' },
    { name: 'Phuket', category: 'Thailand' },
    { name: 'Maui', category: 'Hawaii' },
    { name: 'Cancún', category: 'Mexico' },
    { name: 'Ibiza', category: 'Spain' },
  ],
  'Popular Destinations': [
    { name: 'Cape Town', category: 'Western Cape' },
    { name: 'Johannesburg', category: 'Gauteng' },
    { name: 'Durban', category: 'KwaZulu-Natal' },
    { name: 'Pretoria', category: 'Gauteng' },
    { name: 'London', category: 'United Kingdom' },
    { name: 'Paris', category: 'France' },
    { name: 'New York', category: 'New York' },
    { name: 'Tokyo', category: 'Japan' },
  ],
};

const HomePage = () => {
  const [listings, setListings] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [activeTab, setActiveTab] = useState('Arts & Culture');

  // Guests Dropdown States
  const [adults, setAdults] = useState(0);
  const [childrenCount, setChildrenCount] = useState(0);
  const [showGuestsDropdown, setShowGuestsDropdown] = useState(false);
  const guestsDropdownRef = useRef(null);

  const listingsRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const fetchListings = async () => {
      try {
        const res = await api.get('/listings');
        if (!isMounted) return;

        const listingsWithImages = res.data.map((listing) => {
          let imageUrl = DEFAULT_LISTING_IMG;
          if (Array.isArray(listing.images) && listing.images.length > 0) {
            imageUrl = listing.images[0];
          } else if (listing.image) {
            imageUrl = listing.image;
          }
          return { ...listing, displayImage: imageUrl };
        });

        setListings(listingsWithImages);
      } catch (err) {
        console.error('Error fetching listings:', err);
      }
    };

    fetchListings();
    return () => {
      isMounted = false;
    };
  }, []);

  // Close guest dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        guestsDropdownRef.current &&
        !guestsDropdownRef.current.contains(event.target)
      ) {
        setShowGuestsDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const totalGuests = adults + childrenCount;
  const guestSummary = totalGuests === 0 ? '0 guests' : `${totalGuests} guest${totalGuests > 1 ? 's' : ''}`;

  const handleSearch = (searchTerm) => {
    if (typeof searchTerm === 'string') {
      setSelectedCity(searchTerm);
    }
    if (listingsRef.current) {
      listingsRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const filteredListings = useMemo(() => {
    if (!selectedCity) return listings;
    const filterTerm = selectedCity.toLowerCase().trim();

    return listings.filter((item) => {
      const location = (item.location || '').toLowerCase();
      const title = (item.title || '').toLowerCase();
      const category = (item.category || '').toLowerCase();
      const type = (item.type || '').toLowerCase();

      return (
        location.includes(filterTerm) ||
        title.includes(filterTerm) ||
        category.includes(filterTerm) ||
        type.includes(filterTerm)
      );
    });
  }, [listings, selectedCity]);

  const getSearchQueryString = () => {
    const queryParams = new URLSearchParams();
    if (selectedCity) queryParams.append('location', selectedCity);
    if (checkIn) queryParams.append('checkIn', checkIn);
    if (checkOut) queryParams.append('checkOut', checkOut);
    if (totalGuests > 0) queryParams.append('guests', totalGuests);
    const str = queryParams.toString();
    return str ? `?${str}` : '';
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-white text-gray-900">
      <div>
        {/* Top Floating/Attached Compact Search Bar Container */}
        <div className="bg-gray-900 pb-4 px-6 flex justify-center border-b border-gray-800">
          <div className="w-full max-w-3xl">
            <div className="bg-white text-black rounded-full shadow-lg border border-gray-200 py-2 px-4 flex items-center justify-between text-xs divide-x divide-gray-200 relative">
              
              {/* Location */}
              <div className="px-3 flex-1">
                <span className="block text-[9px] font-bold text-gray-500 uppercase">Locations</span>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full bg-transparent font-medium text-gray-800 focus:outline-none cursor-pointer truncate"
                >
                  <option value="">Select a Location</option>
                  <option value="Cape Town">Cape Town</option>
                  <option value="Johannesburg">Johannesburg</option>
                  <option value="Durban">Durban</option>
                  <option value="Pretoria">Pretoria</option>
                  <option value="Knysna">Knysna</option>
                  <option value="Thohoyandou">Thohoyandou</option>
                  <option value="Midrand">Midrand</option>
                </select>
              </div>

              {/* Check in */}
              <div className="px-3 flex-1">
                <span className="block text-[9px] font-bold text-gray-500 uppercase">Check in date</span>
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full bg-transparent text-gray-600 focus:outline-none cursor-pointer"
                />
              </div>

              {/* Check out */}
              <div className="px-3 flex-1">
                <span className="block text-[9px] font-bold text-gray-500 uppercase">Checkout date</span>
                <input
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full bg-transparent text-gray-600 focus:outline-none cursor-pointer"
                />
              </div>

              {/* Guests with Counter Dropdown */}
              <div className="px-3 flex-1 relative" ref={guestsDropdownRef}>
                <div 
                  onClick={() => setShowGuestsDropdown((prev) => !prev)}
                  className="cursor-pointer"
                >
                  <span className="block text-[9px] font-bold text-gray-500 uppercase">Guests</span>
                  <div className="w-full bg-transparent text-gray-800 font-medium focus:outline-none truncate pt-0.5">
                    {guestSummary}
                  </div>
                </div>

                {showGuestsDropdown && (
                  <div className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 p-5 z-50 text-xs">
                    {/* Adults Row */}
                    <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                      <div>
                        <p className="font-bold text-gray-900">Adults</p>
                        <p className="text-[11px] text-gray-500">Ages 13 or above</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <button
                          type="button"
                          onClick={() => setAdults((prev) => Math.max(0, prev - 1))}
                          disabled={adults <= 0}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-gray-900 disabled:opacity-30 disabled:hover:border-gray-300 transition cursor-pointer"
                        >
                          -
                        </button>
                        <span className="font-bold w-4 text-center">{adults}</span>
                        <button
                          type="button"
                          onClick={() => setAdults((prev) => prev + 1)}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-gray-900 transition cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Children Row */}
                    <div className="flex items-center justify-between pt-4">
                      <div>
                        <p className="font-bold text-gray-900">Children</p>
                        <p className="text-[11px] text-gray-500">Ages 2–12</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <button
                          type="button"
                          onClick={() => setChildrenCount((prev) => Math.max(0, prev - 1))}
                          disabled={childrenCount <= 0}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-gray-900 disabled:opacity-30 disabled:hover:border-gray-300 transition cursor-pointer"
                        >
                          -
                        </button>
                        <span className="font-bold w-4 text-center">{childrenCount}</span>
                        <button
                          type="button"
                          onClick={() => setChildrenCount((prev) => prev + 1)}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-gray-900 transition cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Search Icon Button */}
              <div className="pl-2">
                <button
                  onClick={() => handleSearch()}
                  className="bg-rose-500 hover:bg-rose-600 text-white p-2.5 rounded-full flex items-center justify-center transition shadow cursor-pointer"
                  aria-label="Search"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M10 2a8 8 0 105.293 14.293l4.707 4.707 1.414-1.414-4.707-4.707A8 8 0 0010 2zm0 2a6 6 0 110 12 6 6 0 010-12z" />
                  </svg>
                </button>
              </div>

            </div>
          </div>
        </div>

       {/* Hero Banner with Clean Background and Text Only */}
        <div
          className="relative w-full h-[400px] flex flex-col justify-center items-center"
          style={{
            backgroundImage: `url('https://homefromhome.co.za/wp-content/uploads/2024/11/1-18.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        >
          <div className="absolute inset-0 bg-black/40"></div>

          <div className="relative z-10 text-center">
            <h1 className="text-2xl md:text-3xl font-bold mb-2 tracking-tight text-white">
              Make your next trip unforgettable.
            </h1>
            <button 
              onClick={() => handleSearch()}
              className="bg-[#ff385c] text-white font-semibold px-6 py-3 rounded-full shadow-md hover:scale-105 transition cursor-pointer"
            >
              Start Exploring
            </button>
          </div>
        </div>

        {/* Section A: Inspiration for Your Next Trip */}
        <section className="max-w-7xl mx-auto px-6 pt-12 pb-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Inspiration for your next trip
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {INSPIRATION_LOCATIONS.map((loc) => (
              <div
                key={loc.id}
                onClick={() => handleSearch(loc.city)}
                className="cursor-pointer group flex flex-col rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition bg-white border border-gray-100"
              >
                <div className="h-44 overflow-hidden relative">
                  <img
                    src={loc.image}
                    alt={loc.city}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                </div>
                <div className={`${loc.color} p-5 text-white flex-1 flex flex-col justify-center`}>
                  <h3 className="font-bold text-lg">{loc.city}</h3>
                  <p className="text-xs text-white/90 font-medium mt-1">{loc.distance}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section B: Discover Experiences */}
        <section className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Discover Experiences</h2>
            <p className="text-gray-500 text-sm">Unique activities hosted by local experts.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {EXPERIENCE_CARDS.map((item) => (
              <div
                key={item.id}
                onClick={() => handleSearch(item.category)}
                className="relative h-96 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-end p-8 text-white group cursor-pointer"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                <div className="relative z-10 max-w-sm">
                  <h3 className="text-2xl font-bold mb-2 leading-tight">{item.title}</h3>
                  <p className="text-xs text-gray-200 mb-5 leading-relaxed font-medium">{item.subtitle}</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSearch(item.category);
                    }}
                    className="bg-white text-gray-900 font-semibold px-5 py-2.5 rounded-xl text-xs hover:bg-gray-100 transition shadow-sm cursor-pointer"
                  >
                    {item.buttonText}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section C: Shop Gift Cards Banner */}
        <section className="max-w-7xl mx-auto px-6 py-6">
          <div className="relative rounded-3xl bg-neutral-900 text-white overflow-hidden p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-md">
            <div className="max-w-md z-10 text-center md:text-left">
              <h2 className="text-3xl font-extrabold mb-3 tracking-tight">Shop gift cards</h2>
              <p className="text-gray-300 text-sm mb-6 leading-relaxed">
                Give the gift of travel, unique stays, and unforgettable experiences to friends, family, or colleagues.
              </p>
              <button
                onClick={() => navigate('/create-listing')}
                className="bg-rose-500 hover:bg-rose-600 text-white font-semibold px-6 py-3 rounded-xl text-xs transition shadow-md cursor-pointer"
              >
                Learn More
              </button>
            </div>
            
            {/* Overlapping 3 Gift Cards Container */}
            <div className="relative z-10 w-full md:w-1/2 h-64 flex items-center justify-center">
              <div className="relative w-72 h-44">
                {/* Left Card (Landscape illustration with Logo Icon) */}
                <div className="absolute left-0 top-6 w-36 h-24 rounded-xl overflow-hidden shadow-2xl transform -rotate-12 border-2 border-white/20 bg-cover bg-center" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=500&q=80')` }}>
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white drop-shadow-md" viewBox="0 0 32 32" fill="currentColor">
                      <path d="M16 1c-4.4 0-8 3.6-8 8 0 5.1 7.1 13.5 7.4 13.9l.6.7.6-.7c.3-.4 7.4-8.8 7.4-13.9 0-4.4-3.6-8-8-8zm0 11a3 3 0 110-6 3 3 0 010 6z"/>
                    </svg>
                  </div>
                </div>

                {/* Center Card (Red branded card) */}
                <div className="absolute left-16 top-0 w-36 h-24 bg-rose-500 rounded-xl shadow-2xl transform rotate-3 flex items-center justify-center border-2 border-white/20 z-10">
                  <span className="text-white font-extrabold tracking-widest text-lg">airbnb</span>
                </div>

                {/* Right Card (Coastal illustration with Logo Icon) */}
                <div className="absolute left-32 top-8 w-36 h-24 rounded-xl overflow-hidden shadow-2xl transform rotate-12 border-2 border-white/20 z-25 bg-cover bg-center" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=500&q=80')` }}>
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white drop-shadow-md" viewBox="0 0 32 32" fill="currentColor">
                      <path d="M16 1c-4.4 0-8 3.6-8 8 0 5.1 7.1 13.5 7.4 13.9l.6.7.6-.7c.3-.4 7.4-8.8 7.4-13.9 0-4.4-3.6-8-8-8zm0 11a3 3 0 110-6 3 3 0 010 6z"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Listings Section */}
        <div ref={listingsRef} className="max-w-7xl mx-auto px-6 py-10">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Explore South Africa</h2>
              <p className="text-gray-500 text-sm">Discover unforgettable destinations and find the perfect place to stay.</p>
            </div>
            {selectedCity && (
              <button
                onClick={() => setSelectedCity('')}
                className="text-xs font-semibold text-rose-500 hover:underline cursor-pointer"
              >
                Clear filter ({selectedCity})
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredListings.map((item) => (
              <div
                key={item._id || item.id}
                onClick={() => navigate(`/listings/${item._id || item.id}${getSearchQueryString()}`)}
                className="cursor-pointer group border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition bg-white"
              >
                <div className="w-full h-48 overflow-hidden bg-gray-100">
                  <img
                    src={item.displayImage}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    onError={(e) => {
                      e.target.src = DEFAULT_LISTING_IMG;
                    }}
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 truncate">{item.title}</h3>
                  <p className="text-gray-500 text-xs mb-2">{item.location}</p>
                  <p className="font-bold text-gray-900 text-sm">
                    R{item.price}{' '}
                    <span className="font-normal text-xs text-gray-500">/ night</span>
                  </p>
                </div>
              </div>
            ))}
          </div>

          {filteredListings.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No properties found matching "{selectedCity}".
            </div>
          )}
        </div>

        {/* Section D: Inspiration for Future Getaways */}
        <section className="max-w-7xl mx-auto px-6 py-12 border-t border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Inspiration for future getaways</h2>
          <div className="flex border-b border-gray-200 overflow-x-auto gap-8 mb-6 no-scrollbar">
            {Object.keys(FUTURE_GETAWAYS).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-sm font-semibold whitespace-nowrap transition cursor-pointer ${
                  activeTab === tab
                    ? 'border-b-2 border-black text-black'
                    : 'text-gray-500 hover:text-black'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-y-4 gap-x-6">
            {FUTURE_GETAWAYS[activeTab].map((loc, idx) => (
              <div key={idx} onClick={() => handleSearch(loc.name)} className="cursor-pointer group">
                <div className="text-xs font-bold text-gray-900 group-hover:underline truncate">{loc.name}</div>
                <div className="text-xs text-gray-500 truncate">{loc.category}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomePage;