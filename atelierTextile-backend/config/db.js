const mongoose = require('mongoose');
const { seedDataWithoutExit } = require('../seeder');
const User = require('../models/User');
const Design = require('../models/Design');

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

    // Run design range migration for existing designs
    try {
      const parseRangeNumbers = (str) => {
        if (!str) return { min: null, max: null };
        const matches = String(str).match(/\d+/g);
        if (!matches || matches.length === 0) return { min: null, max: null };
        const nums = matches.map(Number);
        const min = nums[0];
        const max = nums.length > 1 ? nums[1] : nums[0];
        return { min, max };
      };

      const designsToMigrate = await Design.find({
        $or: [
          { areaMin: { $exists: false } },
          { areaMax: { $exists: false } },
          { needleMin: { $exists: false } },
          { needleMax: { $exists: false } }
        ]
      });

      if (designsToMigrate.length > 0) {
        console.log(`🔄 Migrating range fields for ${designsToMigrate.length} designs...`);
        for (const design of designsToMigrate) {
          const areaRange = parseRangeNumbers(design.area);
          const needleRange = parseRangeNumbers(design.needle);
          design.areaMin = areaRange.min;
          design.areaMax = areaRange.max;
          design.needleMin = needleRange.min;
          design.needleMax = needleRange.max;
          await design.save();
        }
        console.log('✅ Range fields migration completed successfully!');
      }
    } catch (migError) {
      console.error('❌ Range migration failed:', migError.message);
    }

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
