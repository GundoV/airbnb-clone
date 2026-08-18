const mongoose = require('mongoose');

// Define Mongoose schema for property listings including pricing, features, and host references
const listingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    price: { type: Number, required: true },
    pricePerNight: { type: Number },
    image: { type: String },
    imageUrl: { type: String },
    images: [{ type: String }],
    guests: { type: Number, default: 1 },
    bedrooms: { type: Number, default: 1 },
    bathrooms: { type: Number, default: 1 },
    category: { type: String, default: 'Apartments' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    host: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Listing', listingSchema);