const Reservation = require('../models/Reservation');

// Create a new reservation after validating user authentication and payload data
const createReservation = async (req, res) => {
  try {
    const { 
      accommodation, 
      listing, 
      host, 
      checkIn, 
      checkInDate, 
      checkOut, 
      checkOutDate, 
      guests, 
      totalPrice 
    } = req.body;

    // Ensure we capture user ID safely from auth middleware
    const userId = req.user?._id || req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User authentication required' });
    }

    // Insert new reservation record into the database
    const reservation = await Reservation.create({
      accommodation: accommodation || listing,
      user: userId,
      host: host || null,
      checkIn: checkIn || checkInDate,
      checkOut: checkOut || checkOutDate,
      guests,
      totalPrice,
    });

    res.status(201).json(reservation);
  } catch (error) {
    console.error('Create Reservation Error:', error);
    res.status(400).json({ message: 'Failed to create reservation', error: error.message });
  }
};

// Retrieve all reservations associated with the authenticated host, populated with details
const getHostReservations = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const reservations = await Reservation.find({ host: userId }).populate('accommodation user');
    res.status(200).json(reservations);
  } catch (error) {
    console.error('Get Host Reservations Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Retrieve all reservations made by the currently authenticated user
const getUserReservations = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const reservations = await Reservation.find({ user: userId }).populate('accommodation');
    res.status(200).json(reservations);
  } catch (error) {
    console.error('Get User Reservations Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Cancel and remove a specific reservation by its ID
const deleteReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    await reservation.deleteOne();
    res.status(200).json({ id: req.params.id, message: 'Reservation cancelled' });
  } catch (error) {
    console.error('Delete Reservation Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createReservation,
  getHostReservations,
  getUserReservations,
  deleteReservation,
};