const Listing = require('../models/Listing');

// Create a new property listing with validation for price and image fields
exports.createListing = async (req, res) => {
  try {
    const {
      title,
      description,
      location,
      price,
      pricePerNight,
      image,
      imageUrl,
      images,
      guests,
      bedrooms,
      bathrooms,
      category,
    } = req.body;

    const numericPrice = Number(price ?? pricePerNight);

    if (isNaN(numericPrice) || numericPrice <= 0) {
      return res.status(400).json({ message: 'Please add a valid price per night' });
    }

    const userId = req.user ? (req.user._id || req.user.id) : undefined;
    const primaryImage = imageUrl || image || (images && images[0]) || '';

    // Insert new listing document into the database
    const listing = await Listing.create({
      title,
      description,
      location,
      price: numericPrice,
      pricePerNight: numericPrice,
      image: primaryImage,
      imageUrl: primaryImage,
      images: images || (primaryImage ? [primaryImage] : []),
      guests: Number(guests) || 1,
      bedrooms: Number(bedrooms) || 1,
      bathrooms: Number(bathrooms) || 1,
      category: category || 'Apartments',
      host: userId,
      user: userId,
    });

    res.status(201).json(listing);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Retrieve all property listings from the database
exports.getListings = async (req, res) => {
  try {
    const listings = await Listing.find({});
    res.json(listings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Fetch a single property listing by its unique ID
exports.getListingById = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (listing) res.json(listing);
    else res.status(404).json({ message: 'Listing not found' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update an existing property listing using request payload mapping
exports.updateListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Optional: Ownership Verification (uncomment if you want to restrict updates to the listing owner)
    // const userId = req.user ? (req.user._id || req.user.id) : null;
    // if (listing.user && listing.user.toString() !== userId?.toString()) {
    //   return res.status(403).json({ message: 'User not authorized to update this listing' });
    // }

    const inputImage = req.body.imageUrl || req.body.image || (req.body.images && req.body.images[0]) || listing.image;
    const numericPrice = req.body.price ? Number(req.body.price) : listing.price;

    // Explicit field mapping ensures Mongoose updates fields regardless of frontend naming differences
    const updatePayload = {
      title: req.body.title || listing.title,
      description: req.body.description || listing.description,
      location: req.body.location || req.body.city || listing.location,
      price: numericPrice,
      pricePerNight: numericPrice,
      image: inputImage,
      imageUrl: inputImage,
      images: [inputImage],
      guests: req.body.guests ? Number(req.body.guests) : listing.guests,
      bedrooms: req.body.bedrooms ? Number(req.body.bedrooms) : listing.bedrooms,
      bathrooms: req.body.bathrooms ? Number(req.body.bathrooms) : listing.bathrooms,
      category: req.body.category || listing.category,
    };

    const updatedListing = await Listing.findByIdAndUpdate(
      req.params.id,
      { $set: updatePayload },
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedListing);
  } catch (error) {
    console.error('Update Error:', error);
    res.status(400).json({ message: error.message });
  }
};

// Delete a property listing by its unique ID
exports.deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    await Listing.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Listing removed successfully', id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};