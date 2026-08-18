const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const { protect } = require('../middleware/authMiddleware');

// CREATE RESERVATION / BOOKING
router.post('/', protect, async (req, res) => {
  try {
    const currentUserId = req.user ? (req.user._id || req.user.id) : undefined;
    
    // Log incoming body to verify frontend payload
    console.log('Incoming Booking Payload:', req.body);

    const {
      listingId,
      listing,
      checkIn,
      checkInDate,
      checkOut,
      checkOutDate,
      guests,
      guestsCount,
      numberOfGuests,
      totalPrice,
      price,
    } = req.body;

    // Force guest count extraction
    const selectedGuests = Number(guests || guestsCount || numberOfGuests || 1);
    const targetListing = listingId || listing;
    const startDate = checkIn || checkInDate;
    const endDate = checkOut || checkOutDate;
    const finalPrice = Number(totalPrice || price || 0);

    const bookingData = {
      user: currentUserId,
      userId: currentUserId,
      listing: targetListing,
      checkIn: startDate,
      checkInDate: startDate,
      checkOut: endDate,
      checkOutDate: endDate,
      guests: selectedGuests,
      guestsCount: selectedGuests,
      numberOfGuests: selectedGuests,
      totalPrice: finalPrice,
    };

    const newBooking = new Booking(bookingData);
    const savedBooking = await newBooking.save();

    res.status(201).json(savedBooking);
  } catch (error) {
    console.error('Booking Creation Error:', error);
    res.status(400).json({ message: error.message });
  }
});

// GET USER RESERVATIONS
router.get(['/user', '/'], protect, async (req, res) => {
  try {
    const currentUserId = req.user ? (req.user._id || req.user.id) : undefined;
    const bookings = await Booking.find({
      $or: [{ user: currentUserId }, { userId: currentUserId }],
    }).populate('listing');

    const formattedBookings = bookings.map((b) => {
      const doc = b.toObject();
      const guestValue = doc.guests || doc.guestsCount || doc.numberOfGuests || 1;
      return {
        ...doc,
        guests: guestValue,
        guestsCount: guestValue,
        numberOfGuests: guestValue,
      };
    });

    res.json(formattedBookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// CANCEL / DELETE RESERVATION
router.delete('/:id', protect, async (req, res) => {
  try {
    await Booking.findByIdAndDelete(req.params.id);
    res.json({ message: 'Reservation cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;