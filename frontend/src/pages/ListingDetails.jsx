import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import axios from '../api/axios';

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80';

export default function ListingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize dates and guests from URL search parameters if available
  const [checkIn, setCheckIn] = useState(searchParams.get('checkIn') || '');
  const [checkOut, setCheckOut] = useState(searchParams.get('checkOut') || '');
  
  // Parse initial guests or default to 1 adult
  const initialGuests = parseInt(searchParams.get('guests'), 10) || 1;
  const [adults, setAdults] = useState(initialGuests);
  const [childrenCount, setChildrenCount] = useState(0);
  
  const [showGuestsDropdown, setShowGuestsDropdown] = useState(false);
  const guestsDropdownRef = useRef(null);

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Theme-based image galleries for dynamic fallbacks
  const themeGalleries = {
    knysna: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=600&q=80',
    ],
    ngv: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=600&q=80',
    ],
    gundo: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=600&q=80',
    ],
    nemandivhe: [
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1613977257592-4871e5fcd7c4?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=600&q=80',
    ],
    default: [
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=600&q=80',
    ],
  };

  const getGalleryForTitle = (title = '') => {
    const lower = title.toLowerCase();
    if (lower.includes('knysna') || lower.includes('lagoon')) return themeGalleries.knysna;
    if (lower.includes('ngv')) return themeGalleries.ngv;
    if (lower.includes('gundo')) return themeGalleries.gundo;
    if (lower.includes('nemandivhe')) return themeGalleries.nemandivhe;
    return themeGalleries.default;
  };

  const fetchListing = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`/listings/${id}`);
      setListing(res.data);
    } catch (err) {
      console.error('Failed to fetch listing details:', err);
      setError(err.response?.data?.message || 'Failed to load listing details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchListing();
  }, [fetchListing]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (guestsDropdownRef.current && !guestsDropdownRef.current.contains(event.target)) {
        setShowGuestsDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const totalGuests = adults + childrenCount;
  const guestSummary = totalGuests === 1 ? '1 guest' : `${totalGuests} guests`;

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const timeDiff = end.getTime() - start.getTime();
    const days = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return days > 0 ? days : 0;
  };

  const nights = calculateNights();

  const basePrice = listing ? Number(listing.price || 0) * nights : 0;
  const cleaningFee = listing?.cleaningFee ?? 350;
  const serviceFee = listing?.serviceFee ?? 250;
  const occupancyTaxes = listing?.occupancyTaxes ?? 150;
  const weeklyDiscount = nights >= 7 ? (listing?.weeklyDiscount ?? 500) : 0;

  const totalPrice = nights > 0 ? basePrice + cleaningFee + serviceFee + occupancyTaxes - weeklyDiscount : 0;

  const handleReserve = async () => {
    if (!checkIn || !checkOut) {
      setError('Please select check-in and check-out dates.');
      return;
    }

    if (nights <= 0) {
      setError('Check-out date must be after check-in date.');
      return;
    }

    const token = localStorage.getItem('token');
    const listingId = listing?._id || listing?.id;

    if (!token) {
      localStorage.setItem(
        'pendingBooking',
        JSON.stringify({ listingId, checkIn, checkOut, guests: totalGuests, totalPrice })
      );
      navigate('/login');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await axios.post(
        '/reservations',
        {
          listing: listingId,
          listingId: listingId,
          checkIn,
          checkOut,
          guests: Number(totalGuests),
          totalPrice,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      navigate('/reservations');
    } catch (err) {
      console.error('Failed to create reservation:', err);
      setError(err.response?.data?.message || 'Failed to create reservation. Check backend connection.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-24">
        <p className="text-gray-500 font-medium">Loading stay details...</p>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="max-w-7xl mx-auto p-6 text-center">
        <div className="mb-4 p-4 bg-red-50 text-red-700 text-sm rounded-xl border border-red-200 inline-block">
          {error || 'Listing not found.'}
        </div>
        <div>
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-900 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const selectedTheme = getGalleryForTitle(listing.title);

  const primaryImage = listing.image || listing.images?.[0] || selectedTheme[0];
  const galleryImages = [
    primaryImage,
    listing.images?.[1] || selectedTheme[1],
    listing.images?.[2] || selectedTheme[2],
    listing.images?.[3] || selectedTheme[3],
    listing.images?.[4] || selectedTheme[4],
  ];

  const rawHostName = listing.hostName || listing.host?.name || listing.host;
  const hostName =
    !rawHostName ||
    rawHostName === 'Host' ||
    rawHostName === 'host' ||
    /^[0-9a-fA-F]{24}$/.test(rawHostName)
      ? 'Gundo'
      : rawHostName;

  return (
    <div className="max-w-7xl mx-auto p-6 text-gray-900">
      {/* Title & Metadata */}
      <h1 className="text-3xl font-bold mb-1">{listing.title}</h1>
      <div className="flex items-center space-x-2 text-sm text-gray-700 font-medium mb-6">
        <span>★</span>
        <span className="font-bold">{listing.rating || '4.8'}</span>
        <span className="underline">({listing.reviews || 2} reviews)</span>
        <span>·</span>
        <span className="underline">{listing.location || listing.city || 'South Africa'}</span>
        <span>·</span>
        <span className="text-gray-500">{listing.type || 'Entire apartment'}</span>
      </div>

      {/* 5-Image Gallery */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 rounded-2xl overflow-hidden mb-10 h-[420px]">
        <div className="md:col-span-2 h-full bg-gray-100">
          <img
            src={galleryImages[0]}
            alt={listing.title}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = DEFAULT_IMAGE;
            }}
            className="w-full h-full object-cover hover:opacity-95 transition"
          />
        </div>
        <div className="hidden md:grid col-span-2 grid-cols-2 gap-2 h-full bg-gray-100">
          {galleryImages.slice(1, 5).map((imgUrl, index) => (
            <img
              key={index}
              src={imgUrl}
              alt={`Gallery ${index + 2}`}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = DEFAULT_IMAGE;
              }}
              className="w-full h-[206px] object-cover hover:opacity-95 transition"
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Section */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between pb-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-1">
                {listing.type || 'Stay'} hosted by {hostName}
              </h2>
              <p className="text-sm text-gray-600">
                {listing.guests || 2} guests &bull; {listing.bedrooms || 1} bedrooms &bull; {listing.bathrooms || 1} bathrooms
              </p>
            </div>
            <div className="w-12 h-12 bg-rose-500 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-sm">
              {hostName.charAt(0).toUpperCase()}
            </div>
          </div>

          <div className="pb-6 border-b border-gray-200">
            <h3 className="font-semibold text-lg mb-3">Where you'll sleep</h3>
            <div className="p-4 border border-gray-200 rounded-xl w-48 bg-gray-50 shadow-sm">
              <div className="font-semibold text-sm">Bedroom</div>
              <div className="text-xs text-gray-500 mt-1">{listing.bedrooms || 1} Double Bed(s)</div>
            </div>
          </div>

          <div className="pb-6 border-b border-gray-200">
            <h3 className="font-semibold text-lg mb-3">What this place offers</h3>
            <div className="grid grid-cols-2 gap-3 text-sm text-gray-700">
              {Array.isArray(listing.amenities) && listing.amenities.length > 0 ? (
                listing.amenities.map((amenity, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span className="capitalize">{amenity}</span>
                  </div>
                ))
              ) : (
                <>
                  <div className="flex items-center space-x-2"><span className="text-green-600 font-bold">✓</span><span>Wifi</span></div>
                  <div className="flex items-center space-x-2"><span className="text-green-600 font-bold">✓</span><span>Kitchen</span></div>
                  <div className="flex items-center space-x-2"><span className="text-green-600 font-bold">✓</span><span>Free parking</span></div>
                </>
              )}
            </div>
          </div>

          <div className="pb-6 border-b border-gray-200">
            <h3 className="font-semibold text-lg mb-2">About this place</h3>
            <p className="text-gray-700 leading-relaxed text-sm whitespace-pre-line">
              {listing.description || 'Enjoy a comfortable stay at this spacious property.'}
            </p>
          </div>

          {/* House Rules Section */}
          <div className="pb-6 border-b border-gray-200">
            <h3 className="font-semibold text-lg mb-4">House rules</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
              {Array.isArray(listing.houseRules) && listing.houseRules.length > 0 ? (
                listing.houseRules.map((rule, idx) => (
                  <div key={idx} className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-gray-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{rule}</span>
                  </div>
                ))
              ) : (
                <>
                  <div className="flex items-center space-x-3">
                    <span className="font-medium text-gray-900">•</span>
                    <span>Check-in: After 3:00 PM</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="font-medium text-gray-900">•</span>
                    <span>Checkout: 11:00 AM</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="font-medium text-gray-900">•</span>
                    <span>Not suitable for pets</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="font-medium text-gray-900">•</span>
                    <span>No parties or events</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="font-medium text-gray-900">•</span>
                    <span>Smoking is strictly prohibited</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Health & Safety Section */}
          <div className="pb-6 border-b border-gray-200">
            <h3 className="font-semibold text-lg mb-4">Health & safety</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
              <div className="flex items-center space-x-3">
                <span className="text-green-600 font-bold">✓</span>
                <span>Committed to enhanced cleaning process</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-green-600 font-bold">✓</span>
                <span>Smoke alarm installed</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-green-600 font-bold">✓</span>
                <span>Carbon monoxide alarm not reported</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-green-600 font-bold">✓</span>
                <span>Self check-in with building staff or lockbox</span>
              </div>
            </div>
          </div>

          {/* Cancellation Policy Section */}
          <div className="pb-6 border-b border-gray-200">
            <h3 className="font-semibold text-lg mb-2">Cancellation policy</h3>
            <p className="text-sm text-gray-700 leading-relaxed mb-2">
              <span className="font-semibold text-gray-900">Moderate:</span> Cancel up to 5 days before check-in for a full refund, minus the service fee.
            </p>
            <p className="text-xs text-gray-500">
              Review your host's full cancellation policy which applies even if you cancel for illness.
            </p>
          </div>

          {/* Reviews Section */}
          <div className="pb-6 border-b border-gray-200">
            <div className="flex items-center space-x-2 text-xl font-semibold mb-6">
              <span>★</span>
              <span>{listing.rating || '4.8'}</span>
              <span>·</span>
              <span>{listing.reviews || 2} reviews</span>
            </div>

            {/* Ratings Breakdown Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3 mb-8 text-sm text-gray-700">
              <div className="flex justify-between items-center">
                <span>Cleanliness</span>
                <div className="flex items-center space-x-3 w-36">
                  <div className="flex-1 bg-gray-200 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-gray-900 h-full w-[96%]"></div>
                  </div>
                  <span className="font-semibold text-xs">4.9</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>Accuracy</span>
                <div className="flex items-center space-x-3 w-36">
                  <div className="flex-1 bg-gray-200 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-gray-900 h-full w-[98%]"></div>
                  </div>
                  <span className="font-semibold text-xs">4.9</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>Communication</span>
                <div className="flex items-center space-x-3 w-36">
                  <div className="flex-1 bg-gray-200 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-gray-900 h-full w-[100%]"></div>
                  </div>
                  <span className="font-semibold text-xs">5.0</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>Value</span>
                <div className="flex items-center space-x-3 w-36">
                  <div className="flex-1 bg-gray-200 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-gray-900 h-full w-[94%]"></div>
                  </div>
                  <span className="font-semibold text-xs">4.7</span>
                </div>
              </div>
            </div>

            {/* Sample/Dynamic Reviews List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-300 text-gray-700 rounded-full flex items-center justify-center font-bold text-sm">
                    M
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-gray-900">Mula</h4>
                    <p className="text-xs text-gray-500">May 2026</p>
                  </div>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Amazing place! Exceptionally clean, great communication with the host, and smooth check-in process. Would definitely stay again.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-rose-200 text-rose-800 rounded-full flex items-center justify-center font-bold text-sm">
                    N
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-gray-900">Ndamu</h4>
                    <p className="text-xs text-gray-500">April 2026</p>
                  </div>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  The location is fantastic and features wonderful amenities. The views and overall comfort exceeded our expectations!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section / Booking Card */}
        <div>
          <div className="sticky top-24 border border-gray-200 p-6 rounded-2xl shadow-xl h-fit bg-white">
            <div className="flex justify-between items-baseline mb-6">
              <div>
                <span className="text-2xl font-bold">R{Number(listing.price || 0).toLocaleString()}</span>
                <span className="text-gray-500 font-normal text-sm"> / night</span>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 font-medium">
                {error}
              </div>
            )}

            <div className="border border-gray-300 rounded-xl mb-4 overflow-hidden">
              <div className="grid grid-cols-2 border-b border-gray-300">
                <div className="p-2 border-r border-gray-300">
                  <span className="block text-[10px] font-bold uppercase text-gray-500 select-none pointer-events-none">Check-in</span>
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => {
                      setCheckIn(e.target.value);
                      setError('');
                    }}
                    className="w-full text-xs bg-transparent focus:outline-none cursor-pointer"
                  />
                </div>
                <div className="p-2">
                  <span className="block text-[10px] font-bold uppercase text-gray-500 select-none pointer-events-none">Checkout</span>
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => {
                      setCheckOut(e.target.value);
                      setError('');
                    }}
                    className="w-full text-xs bg-transparent focus:outline-none cursor-pointer"
                  />
                </div>
              </div>

              {/* Interactive Guests Dropdown */}
              <div 
                className="p-2 relative cursor-pointer" 
                ref={guestsDropdownRef}
                onClick={() => setShowGuestsDropdown((prev) => !prev)}
              >
                <span className="block text-[10px] font-bold uppercase text-gray-500 select-none pointer-events-none">Guests</span>
                <div className="w-full text-sm font-medium text-gray-800 pt-0.5 truncate pointer-events-none">
                  {guestSummary}
                </div>

                {showGuestsDropdown && (
                  <div 
                    className="absolute left-0 right-0 top-full mt-1 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 z-50 text-xs cursor-default"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Adults Counter */}
                    <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                      <div>
                        <p className="font-bold text-gray-900">Adults</p>
                        <p className="text-[11px] text-gray-500">Ages 13 or above</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <button
                          type="button"
                          onClick={() => setAdults((prev) => Math.max(1, prev - 1))}
                          disabled={adults <= 1}
                          className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-gray-900 disabled:opacity-30 transition cursor-pointer"
                        >
                          -
                        </button>
                        <span className="font-bold w-4 text-center">{adults}</span>
                        <button
                          type="button"
                          onClick={() => setAdults((prev) => prev + 1)}
                          className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-gray-900 transition cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Children Counter */}
                    <div className="flex items-center justify-between pt-3">
                      <div>
                        <p className="font-bold text-gray-900">Children</p>
                        <p className="text-[11px] text-gray-500">Ages 2–12</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <button
                          type="button"
                          onClick={() => setChildrenCount((prev) => Math.max(0, prev - 1))}
                          disabled={childrenCount <= 0}
                          className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-gray-900 disabled:opacity-30 transition cursor-pointer"
                        >
                          -
                        </button>
                        <span className="font-bold w-4 text-center">{childrenCount}</span>
                        <button
                          type="button"
                          onClick={() => setChildrenCount((prev) => prev + 1)}
                          className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-gray-900 transition cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {nights > 0 && (
              <div className="space-y-3 text-xs text-gray-600 my-4 pt-2 border-t border-gray-100">
                <div className="flex justify-between">
                  <span>R{listing.price} x {nights} night(s)</span>
                  <span>R{basePrice.toLocaleString()}</span>
                </div>
                {weeklyDiscount > 0 && (
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>Weekly discount</span>
                    <span>-R{weeklyDiscount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Cleaning fee</span>
                  <span>R{cleaningFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Service fee</span>
                  <span>R{serviceFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Occupancy taxes & fees</span>
                  <span>R{occupancyTaxes.toLocaleString()}</span>
                </div>
                <hr className="my-2 border-gray-200" />
                <div className="flex justify-between font-bold text-gray-900 text-sm">
                  <span>Total before taxes</span>
                  <span>R{totalPrice.toLocaleString()}</span>
                </div>
              </div>
            )}

            <button
              type="button"
              disabled={submitting}
              onClick={handleReserve}
              className="w-full bg-rose-500 hover:bg-rose-600 text-white py-3 rounded-xl font-semibold transition duration-200 mt-2 cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Reserving...' : 'Reserve'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}