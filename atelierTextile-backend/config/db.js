const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { seedDataWithoutExit } = require('../seeder');
const User = require('../models/User');

const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      console.log('⚠️  No MONGODB_URI environment variable found.');
      console.log('🚀 Starting an in-memory MongoDB database server (downloading stable v5.0.19 binary if not cached)...');
      // Set the version to a smaller, stable version to ensure fast download and execution
      process.env.MONGOMS_VERSION = '5.0.19';
      
      const mongoServer = await MongoMemoryServer.create();
      mongoUri = mongoServer.getUri();
      
      console.log(`✅ In-memory MongoDB Server started at: ${mongoUri}`);
    }

    const conn = await mongoose.connect(mongoUri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Check if the database has seed data, if not, automatically seed it
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('🌱 Database is empty. Running automatic database seeder...');
      await seedDataWithoutExit();
    }
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
