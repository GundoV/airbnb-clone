const mongoose = require('mongoose');

// Define Mongoose schema for booking records with support for alternate property naming
const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
    checkIn: { type: Date },
    checkOut: { type: Date },
    guests: { type: Number, default: 1 },
    guestsCount: { type: Number, default: 1 },
    numberOfGuests: { type: Number, default: 1 },
    totalPrice: { type: Number, required: true },
  },
  { timestamps: true, strict: false }
);

module.exports = mongoose.model('Booking', bookingSchema);