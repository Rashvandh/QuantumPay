const mongoose = require('mongoose');

const transactionSchema = mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    amount: {
        type: Number,
        required: true,
    },
    txId: {
        type: String,
        unique: true,
    },
    type: {
        type: String,
        enum: ['SEND', 'RECEIVE', 'ADD'], // SEND: You sent money, RECEIVE: You received money, ADD: You added money to wallet
        required: true,
    },
    status: {
        type: String,
        enum: ['SUCCESS', 'FAILED'],
        default: 'SUCCESS',
    },
    flagged: {
        type: Boolean,
        default: false,
    },
    description: {
        type: String,
    }
}, {
    timestamps: true,
});

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
