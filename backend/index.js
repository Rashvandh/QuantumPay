const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// Database Connection
connectDB();

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/wallet', require('./routes/walletRoutes'));

app.get('/', (req, res) => {
    res.send('QuantumPay API is running...');
});

// Basic error handler middleware (captures thrown errors passed to next(err))
app.use((err, req, res, next) => {
    console.error('Unhandled error middleware:', err);
    if (res.headersSent) return next(err);
    const status = err && err.status ? err.status : 500;
    res.status(status).json({ message: err.message || 'Server error' });
});

const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Handle unexpected promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception thrown:', err);
});

module.exports = server;
