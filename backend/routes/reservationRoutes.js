const express = require('express');
const router = express.Router();
const Reservation = require('../models/Reservation');
const { protect } = require('../middleware/authMiddleware');

// Get reservations for the logged-in user
router.get('/user', protect, async (req, res) => {
  try {
    // strictPopulate: false prevents Mongoose from crashing if the field name varies
    const reservations = await Reservation.find({ user: req.user._id })
      .populate({ path: 'listing', strictPopulate: false })
      .populate({ path: 'listingId', strictPopulate: false })
      .sort({ createdAt: -1 });

    res.json(reservations);
  } catch (error) {
    console.error('Error fetching reservations:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create a new reservation
router.post('/', protect, async (req, res) => {
  try {
    const reservation = new Reservation({
      ...req.body,
      user: req.user._id,
    });

    const createdReservation = await reservation.save();
    res.status(201).json(createdReservation);
  } catch (error) {
    console.error('Error creating reservation:', error);
    res.status(400).json({ message: error.message });
  }
});

// Cancel/Delete a reservation
router.delete('/:id', protect, async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    if (reservation.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to cancel this reservation' });
    }

    await reservation.deleteOne();
    res.json({ message: 'Reservation cancelled successfully' });
  } catch (error) {
    console.error('Error deleting reservation:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;