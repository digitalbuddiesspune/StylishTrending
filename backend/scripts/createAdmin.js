import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@styletrending.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123456';
const ADMIN_NAME = process.env.ADMIN_NAME || 'Admin User';

async function createAdmin() {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('❌ Missing MONGODB_URI in environment.');
      process.exit(1);
    }

    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() });
    
    if (existingAdmin) {
      if (existingAdmin.isAdmin) {
        console.log(`✅ Admin user already exists: ${ADMIN_EMAIL}`);
        console.log('   Email:', ADMIN_EMAIL);
        console.log('   Password:', ADMIN_PASSWORD);
        console.log('\n⚠️  To change password, update the user in the database or use signup/login.');
      } else {
        // Update existing user to admin
        await User.findOneAndUpdate(
          { email: ADMIN_EMAIL.toLowerCase() },
          { $set: { isAdmin: true, role: 'admin' } }
        );
        console.log(`✅ User ${ADMIN_EMAIL} has been promoted to admin.`);
        console.log('   Email:', ADMIN_EMAIL);
        console.log('   Password: (use your existing password)');
      }
    } else {
      // Create new admin user
      const admin = await User.create({
        name: ADMIN_NAME,
        email: ADMIN_EMAIL.toLowerCase(),
        password: ADMIN_PASSWORD,
        role: 'admin',
        isAdmin: true,
      });

      console.log('✅ Admin user created successfully!');
      console.log('\n📋 Admin Credentials:');
      console.log('   Email:', ADMIN_EMAIL);
      console.log('   Password:', ADMIN_PASSWORD);
      console.log('\n⚠️  IMPORTANT: Change the password after first login!');
    }
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

createAdmin();
