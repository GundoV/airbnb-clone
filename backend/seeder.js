const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Listing = require('./models/Listing');
const User = require('./models/User');

dotenv.config();

const sampleListings = [
  {
    title: 'Modern Apartment with Table Mountain View',
    description: 'A stylish 2-bedroom apartment situated in the heart of Cape Town. Features panoramic views of Table Mountain, fast Wi-Fi, and modern amenities.',
    location: 'Cape Town',
    price: 1500,
    maxGuests: 4,
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
      'https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTMzMDM4ODQ5NzgxMTAyMTAzOQ==/original/76b41c7f-3c77-4f56-b26b-1ab3f3a8f9f2.jpeg?im_w=960',
      'https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTMzMDM4ODQ5NzgxMTAyMTAzOQ==/original/a2037612-de1f-439a-b5ef-e7bf45de87ad.jpeg?im_w=720'
    ],
  },
  {
    title: 'Luxury Villa in Camps Bay',
    description: 'Stunning beachfront luxury villa with a private infinity pool overlooking the Atlantic Ocean. Walking distance to Camps Bay beach and top restaurants.',
    location: 'Cape Town',
    price: 4500,
    maxGuests: 8,
    images: [
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
      'https://a0.muscache.com/im/pictures/hosting/Hosting-1263545001244051461/original/04f85d0d-e54f-422c-b215-c965a5780019.jpeg?im_w=1200',
      'https://a0.muscache.com/im/pictures/hosting/Hosting-1263545001244051461/original/159b1b06-de69-463b-ba3d-5769f8485673.jpeg?im_w=1200'

    ],
  },
  {
    title: 'Trendy Industrial Loft in Maboneng',
    description: 'Experience the urban buzz of Johannesburg in this vibrant loft apartment. Located in the creative hub of Maboneng with access to galleries and eateries.',
    location: 'Johannesburg',
    price: 850,
    maxGuests: 2,
    images: [
      'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1200&q=80',
      'https://a0.muscache.com/im/pictures/hosting/Hosting-1675489679748982401/original/8fbab8c4-9c03-4d80-b81a-4bd657251ccd.jpeg?im_w=720',
      'https://a0.muscache.com/im/pictures/hosting/Hosting-1675489679748982401/original/fa9ac12f-6c81-474a-8cb6-0f53b64f67fc.jpeg?im_w=720',
      'https://a0.muscache.com/im/pictures/hosting/Hosting-1263545001244051461/original/a556478e-aea2-4012-911a-8d664c21acee.jpeg?im_w=1200'
    ],
  },
  {
    title: 'Gundo @ Knysna Lagoon Cottage',
    description: 'Nestled on the edge of the Knysna Lagoon, this cozy timber cottage offers scenic views, direct water access, and peace along the Garden Route.',
    location: 'Knysna',
    price: 1200,
    maxGuests: 3,
    images: [
      'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=1200&q=80',
      'https://cf.bstatic.com/xdata/images/hotel/max1024x768/96196758.jpg?k=c145f3c6f2e1a7251277bf47e84ce19e874f40a54724e548852e8a1ef7e72b53&o=',
      'https://cf.bstatic.com/xdata/images/hotel/max1024x768/96196812.jpg?k=7c6dac8307eab55eff5c1df4f6546044e1ebfaf8b2f9266c86093ef56467bdb6&o=',
      'https://cf.bstatic.com/xdata/images/hotel/max1024x768/96196818.jpg?k=cf8ff7b3a8719fde1d2b4d45a239c59a474ea255276b0645df6c3dbbc8e71437&o='
    ],
  },
  {
    title: 'NGV Beach-Front Apartments',
    description: 'Beautiful beach-front apartment in Durban.',
    location: 'Durban',
    price: 1250,
    maxGuests: 4,
    images: [
      'https://a0.muscache.com/im/pictures/4fa46592-3af1-4a49-b02d-af67ab3f03a7.jpg?im_w=1200',
      'https://a0.muscache.com/im/pictures/hosting/Hosting-4267384/original/5889b6c0-d79e-4d09-bd0f-8fe6aa32084b.jpeg?im_w=1200',
      'https://a0.muscache.com/im/pictures/c3bffd8b-391a-41b1-bfc0-15b7cba6e889.jpg?im_w=1200'
        ]
  },
  {
    title: "Gundo's Luxury Apartments",
    description: 'Modern and luxury apartment in Pretoria.',
    location: 'Pretoria',
    price: 1350,
    maxGuests: 2,
    images: [
      'https://a0.muscache.com/im/pictures/de2751fe-f1c4-405c-b462-3b75bbc6bd20.jpg?im_w=1200',
      'https://a0.muscache.com/im/pictures/72660612-f7d6-43d8-af18-be028e4789ce.jpg?im_w=1200',
      'https://a0.muscache.com/im/pictures/ce1222e5-8a1e-4dae-b4da-677f3b41f746.jpg?im_w=1200'
    ]
  },
  {
    title: 'Nemandivhe Stay-inn',
    description: 'Comfortable stay in Thohoyandou.',
    location: 'Thohoyandou',
    price: 860,
    maxGuests: 2,
    images: [
      'https://cf.bstatic.com/xdata/images/hotel/max1024x768/591364583.jpg?k=f73394a8bc7e6a838f8c7619d884d231173118278601d721b8268f71965c2a15&o=',
      'https://cf.bstatic.com/xdata/images/hotel/max1024x768/591364631.jpg?k=03cc9d0a7decee11573f11a5ff9960a40b49f764db645e813f46d0b917e92a46&o=',
      'https://cf.bstatic.com/xdata/images/hotel/max1024x768/591364613.jpg?k=91928cb2c37e645eed1ea79b0af971a6a8c04c1b038a3363761c2acd2cbe64bf&o='
    ]
  }
];

const importData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    let hostUser = await User.findOne();

    if (!hostUser) {
      hostUser = await User.create({
        name: 'Demo Host',
        email: 'host@example.com',
        password: 'password123',
      });
      console.log('Created default host user: host@example.com');
    }

    const sampleData = sampleListings.map((listing) => ({
      ...listing,
      host: hostUser._id,
    }));

    await Listing.deleteMany();
    await Listing.insertMany(sampleData);

    console.log('Data Successfully Seeded! 🚀');
    process.exit();
  } catch (error) {
    console.error(`Error with seeding data: ${error.message}`);
    process.exit(1);
  }
};

importData();