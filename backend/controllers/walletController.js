const User = require('../models/User');
const Transaction = require('../models/Transaction');

// Generate a simple transaction id
const generateTxId = () => {
    return `QP${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`.toUpperCase();
};

// @desc    Add money to wallet
// @route   POST /api/wallet/add
// @access  Private
const addMoney = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const { amount } = req.body;

        const numAmount = Number(amount);
        if (!numAmount || numAmount <= 0) {
            return res.status(400).json({ message: 'Invalid amount' });
        }

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.walletBalance += numAmount;
        await user.save();

        // Create Transaction Record
        const txId = generateTxId();
        await Transaction.create({
            sender: user._id,
            receiver: user._id, // Self for add money
            amount: numAmount,
            txId,
            type: 'ADD',
            status: 'SUCCESS',
            description: 'Added money to wallet',
            flagged: numAmount > 50000,
        });

        res.json({
            message: 'Money added successfully',
            walletBalance: user.walletBalance,
        });
    } catch (error) {
        console.error('addMoney error:', error);
        if (error && error.code === 11000) {
            return res.status(409).json({ message: 'Duplicate transaction id' });
        }
        res.status(500).json({ message: error.message || 'Server error' });
    }
};

// @desc    Send money to another user
// @route   POST /api/wallet/send
// @access  Private
const sendMoney = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const { receiverUpiId, amount } = req.body;
        const numAmount = Number(amount);

        if (!numAmount || numAmount <= 0) {
            return res.status(400).json({ message: 'Invalid amount' });
        }

        const sender = await User.findById(req.user._id);
        const receiver = await User.findOne({ upiId: receiverUpiId });

        if (!sender) return res.status(404).json({ message: 'Sender not found' });

        if (!receiver) {
            return res.status(404).json({ message: 'Receiver not found' });
        }

        if (sender._id.equals(receiver._id)) {
            return res.status(400).json({ message: 'Cannot send money to self' });
        }

        if (sender.walletBalance < numAmount) {
            return res.status(400).json({ message: 'Insufficient balance' });
        }

        // Simulate failure rate (configurable via SIMULATE_FAILURE_RATE env var)
        const rawRate = process.env.SIMULATE_FAILURE_RATE;
        const simulateRate = typeof rawRate !== 'undefined'
            ? Math.max(0, Math.min(1, parseFloat(rawRate) || 0))
            : 0.1; // default 10% failure

        const isSuccess = Math.random() > simulateRate;

        if (!isSuccess) {
            const txId = generateTxId();
            await Transaction.create({
                sender: sender._id,
                receiver: receiver._id,
                amount: numAmount,
                txId,
                type: 'SEND',
                status: 'FAILED',
                description: `Failed transfer to ${receiver.name}`,
                flagged: numAmount > 50000,
            });
            return res.status(400).json({ message: 'Payment Failed (Simulated)', transactionId: txId });
        }

        // Success Flow
        sender.walletBalance -= numAmount;
        receiver.walletBalance += numAmount;

        await sender.save();
        await receiver.save();

        const txId = generateTxId();
        const transaction = await Transaction.create({
            sender: sender._id,
            receiver: receiver._id,
            amount: numAmount,
            txId,
            type: 'SEND',
            status: 'SUCCESS',
            description: `Sent to ${receiver.name}`,
            flagged: numAmount > 50000,
        });

        res.json({
            message: 'Payment Successful',
            transactionId: transaction._id,
            walletBalance: sender.walletBalance,
        });
    } catch (error) {
        console.error('sendMoney error:', error);
        if (error && error.code === 11000) {
            return res.status(409).json({ message: 'Duplicate transaction id' });
        }
        res.status(500).json({ message: error.message || 'Server error' });
    }
};

// @desc    Get transaction history
// @route   GET /api/transactions
// @access  Private
const getTransactions = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const transactions = await Transaction.find({
            $or: [{ sender: req.user._id }, { receiver: req.user._id }]
        })
            .sort({ createdAt: -1 })
            .populate('sender', 'name upiId')
            .populate('receiver', 'name upiId');

        res.json(transactions);
    } catch (error) {
        console.error('getTransactions error:', error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
};


module.exports = { addMoney, sendMoney, getTransactions };
