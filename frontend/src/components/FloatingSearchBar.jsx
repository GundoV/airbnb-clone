import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, X } from 'lucide-react';

function FloatingSearchBar({ onSearch }) {
  const navigate = useNavigate();
  const routerLocation = useLocation();

  // Extract initial values from URL query parameters if available
  const queryParams = new URLSearchParams(routerLocation.search);
  const initialLocation = queryParams.get('location') || '';
  const initialCheckIn = queryParams.get('checkIn') || '';
  const initialCheckOut = queryParams.get('checkOut') || '';
  const initialGuests = Number(queryParams.get('guests')) || 0;

  const [location, setLocation] = useState(initialLocation);
  const [checkIn, setCheckIn] = useState(initialCheckIn);
  const [checkOut, setCheckOut] = useState(initialCheckOut);
  
  // Guest breakdown states to match your HomePage dropdown style
  const [adults, setAdults] = useState(initialGuests > 0 ? initialGuests : 0);
  const [childrenCount, setChildrenCount] = useState(0);
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [showGuestsDropdown, setShowGuestsDropdown] = useState(false);
  const guestsDropdownRef = useRef(null);

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

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsExpanded(false);
        setShowGuestsDropdown(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const totalGuests = adults + childrenCount;
  const guestSummary = totalGuests === 0 ? 'Add guests' : `${totalGuests} guest${totalGuests > 1 ? 's' : ''}`;

  const handleSearchSubmit = (e) => {
    e.preventDefault();

    const searchParams = new URLSearchParams();
    if (location.trim()) searchParams.set('location', location.trim());
    if (checkIn) searchParams.set('checkIn', checkIn);
    if (checkOut) searchParams.set('checkOut', checkOut);
    if (totalGuests > 0) searchParams.set('guests', totalGuests.toString());

    if (onSearch) {
      onSearch({ location, checkIn, checkOut, guests: totalGuests });
    } else {
      navigate(`/?${searchParams.toString()}`);
    }

    setIsExpanded(false);
    setShowGuestsDropdown(false);
  };

  return (
    <>
      {isExpanded && (
        <div
          onClick={() => {
            setIsExpanded(false);
            setShowGuestsDropdown(false);
          }}
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 transition-opacity duration-300"
        />
      )}

      <div className="relative w-full max-w-4xl mx-auto my-4 px-4 z-40">
        {!isExpanded ? (
          /* Collapsed Pill Bar */
          <div
            onClick={() => setIsExpanded(true)}
            className="flex items-center justify-between bg-white border border-gray-300 rounded-full py-2.5 px-6 shadow-md hover:shadow-lg cursor-pointer transition-all duration-200"
          >
            <div className="flex items-center space-x-6 text-xs md:text-sm font-semibold text-gray-800 divide-x divide-gray-200">
              <span className="pr-4">{location || 'Anywhere'}</span>
              <span className="px-4 text-gray-600 font-normal">
                {checkIn && checkOut ? `${checkIn} to ${checkOut}` : 'Any week'}
              </span>
              <span className="pl-4 text-gray-400 font-normal">
                {totalGuests > 0 ? guestSummary : 'Add guests'}
              </span>
            </div>

            <div className="bg-[#FF385C] text-white p-2.5 rounded-full flex items-center justify-center hover:bg-[#E00B41] transition">
              <Search className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
        ) : (
          /* Expanded Search Card */
          <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl p-6 transition-all duration-300">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
              <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Search Stays</h3>
              <button
                type="button"
                onClick={() => {
                  setIsExpanded(false);
                  setShowGuestsDropdown(false);
                }}
                className="p-1 text-gray-500 hover:text-gray-800 rounded-full hover:bg-gray-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              {/* Where / Location */}
              <div className="flex flex-col space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Where</label>
                <input
                  type="text"
                  placeholder="Search destinations (e.g. Cape Town)"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full text-xs font-medium text-gray-800 bg-gray-50 border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#FF385C]"
                />
              </div>

              {/* Check in */}
              <div className="flex flex-col space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Check in</label>
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full text-xs font-medium text-gray-800 bg-gray-50 border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#FF385C]"
                />
              </div>

              {/* Check out */}
              <div className="flex flex-col space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Check out</label>
                <input
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full text-xs font-medium text-gray-800 bg-gray-50 border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#FF385C]"
                />
              </div>

              {/* Guests with Popup Counter */}
              <div className="flex space-x-2 items-center relative" ref={guestsDropdownRef}>
                <div className="flex flex-col space-y-1 flex-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Who</label>
                  <div
                    onClick={() => setShowGuestsDropdown((prev) => !prev)}
                    className="w-full text-xs font-medium text-gray-800 bg-gray-50 border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#FF385C] cursor-pointer truncate"
                  >
                    {guestSummary}
                  </div>

                  {/* Guests Dropdown Popover */}
                  {showGuestsDropdown && (
                    <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 p-5 z-50 text-xs">
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
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-gray-900 disabled:opacity-30 transition cursor-pointer"
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
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-gray-900 disabled:opacity-30 transition cursor-pointer"
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

                <button
                  type="submit"
                  className="h-[42px] px-6 bg-[#FF385C] hover:bg-[#E00B41] text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-2 transition self-end cursor-pointer shadow"
                >
                  <Search className="w-4 h-4 stroke-[2.5]" />
                  <span>Search</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </>
  );
}

export default FloatingSearchBar;