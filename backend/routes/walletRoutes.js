const express = require('express');
const router = express.Router();
const { addMoney, sendMoney, getTransactions } = require('../controllers/walletController');
const { protect } = require('../middleware/authMiddleware');

router.post('/add', protect, addMoney);
router.post('/send', protect, sendMoney);
router.get('/history', protect, getTransactions);

module.exports = router;
