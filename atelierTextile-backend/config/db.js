const mongoose = require('mongoose');
const { seedDataWithoutExit } = require('../seeder');
const User = require('../models/User');

const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      if (process.env.NODE_ENV === 'production') {
        throw new Error(
          'MONGODB_URI is required in production. Configure a persistent MongoDB/Atlas database before starting the API.'
        );
      }

      console.log('No MONGODB_URI found. Starting an in-memory MongoDB database for local development only.');
      process.env.MONGOMS_VERSION = '7.0.14';

      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      mongoUri = mongoServer.getUri();

      console.log(`In-memory MongoDB server started at: ${mongoUri}`);
    }

    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('Database is empty. Running automatic database seeder...');
      await seedDataWithoutExit();
    }
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
