const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('../models/Product');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const products = [
  {
    name: 'Imperial Velvet Bandhgala',
    description: 'A classic navy blue velvet Bandhgala with antique brass buttons and intricate hand-embroidery on the collar.',
    shortDescription: 'Luxurious velvet Bandhgala for formal occasions.',
    category: 'bandhgala',
    occasion: ['wedding', 'party'],
    price: {
      base: 45000,
      discounted: 39999,
      currency: 'INR'
    },
    isBespoke: true,
    isFeatured: true,
    isPublished: true,
    fabricDetails: {
      primaryFabric: 'Premium Velvet',
      composition: '100% Cotton Velvet',
      care: ['Dry clean only', 'Store in a garment bag']
    },
    craftsmanship: {
      embroideryType: 'Zardosi',
      embroideryHours: 40,
      artisans: 3
    },
    images: [
      { url: 'https://res.cloudinary.com/dummy/image/upload/v1/samples/bandhgala-1.jpg', isPrimary: true }
    ],
    variants: [
      { color: 'Navy Blue', stock: 5, sku: 'SC-BND-NVY-01' }
    ]
  },
  {
    name: 'Royal Silk Sherwani',
    description: 'Off-white silk Sherwani featuring delicate tonal threadwork and a matching stole.',
    shortDescription: 'Elegant silk Sherwani for the modern groom.',
    category: 'sherwani',
    occasion: ['wedding'],
    price: {
      base: 65000,
      currency: 'INR'
    },
    isBespoke: true,
    isFeatured: true,
    isPublished: true,
    fabricDetails: {
      primaryFabric: 'Raw Silk',
      composition: '100% Silk',
      care: ['Dry clean only']
    },
    craftsmanship: {
      embroideryType: 'Aari Work',
      embroideryHours: 60,
      artisans: 5
    },
    images: [
      { url: 'https://res.cloudinary.com/dummy/image/upload/v1/samples/sherwani-1.jpg', isPrimary: true }
    ],
    variants: [
      { color: 'Off-white', stock: 3, sku: 'SC-SHR-WHT-01' }
    ]
  },
  {
    name: 'Classic Linen Kurta',
    description: 'Breathable white linen kurta with a mandarin collar and side slits.',
    shortDescription: 'Smart and comfortable linen kurta for daily wear.',
    category: 'kurta',
    occasion: ['casual', 'daily'],
    price: {
      base: 4500,
      discounted: 3500,
      currency: 'INR'
    },
    isBespoke: false,
    isFeatured: false,
    isPublished: true,
    fabricDetails: {
      primaryFabric: 'Linen',
      composition: '100% Linen',
      care: ['Machine wash cold', 'Tumble dry low']
    },
    images: [
      { url: 'https://res.cloudinary.com/dummy/image/upload/v1/samples/kurta-1.jpg', isPrimary: true }
    ],
    variants: [
      { color: 'White', stock: 20, sku: 'SC-KRT-WHT-01' }
    ]
  }
];

const seedProducts = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error('❌ MONGO_URI not found in .env');
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Clear existing products
    await Product.deleteMany({});
    console.log('🗑️  Existing products cleared');

    // Insert new products one by one to trigger pre-save hooks (slug generation)
    for (const productData of products) {
      const product = new Product(productData);
      await product.save();
      console.log(`📦 Seeded: ${product.name}`);
    }
    
    console.log('✅ Initial products seeded successfully');

    process.exit(0);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

seedProducts();
