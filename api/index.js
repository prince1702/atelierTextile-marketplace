const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('../atelierTextile-backend/config/db');
const errorHandler = require('../atelierTextile-backend/middleware/errorHandler');

// Load env
dotenv.config({ path: path.join(__dirname, '../atelierTextile-backend/.env') });

// Connect DB
connectDB();

const app = express();

app.use(cors({
  origin: '*',
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'running',
      timestamp: new Date().toISOString(),
    },
  });
});

// Mount routes
app.use('/api/auth', require('../atelierTextile-backend/routes/auth'));
app.use('/api/designs', require('../atelierTextile-backend/routes/designs'));
app.use('/api/users', require('../atelierTextile-backend/routes/users'));
app.use('/api/orders', require('../atelierTextile-backend/routes/orders'));
app.use('/api/cart', require('../atelierTextile-backend/routes/cart'));
app.use('/api/wishlist', require('../atelierTextile-backend/routes/wishlist'));
app.use('/api/tickets', require('../atelierTextile-backend/routes/tickets'));

app.use(errorHandler);

module.exports = app;
