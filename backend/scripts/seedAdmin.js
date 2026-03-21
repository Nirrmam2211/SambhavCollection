const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const seedAdmin = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error('❌ MONGO_URI not found in .env');
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@sambhavcollection.com';
    const adminPassword = 'AdminPassword123!'; // Default password for seeding

    let user = await User.findOne({ email: adminEmail });

    if (user) {
      console.log(`ℹ️ User ${adminEmail} already exists. Updating role to admin...`);
      user.role = 'admin';
      user.isVerified = true;
      await user.save();
    } else {
      console.log(`ℹ️ Creating new admin user: ${adminEmail}`);
      user = await User.create({
        name: 'System Admin',
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
        isVerified: true,
      });
    }

    console.log('\n─────────────────────────────────────────────');
    console.log('✅ Admin User Successfully Configured');
    console.log(`📧 Email:    ${adminEmail}`);
    console.log(`🔑 Password: ${user ? 'Existing Password' : adminPassword}`);
    console.log('─────────────────────────────────────────────');
    console.log('\nYou can now log in at http://localhost:5173/login');

    process.exit(0);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

seedAdmin();
