import mongoose, { Schema, Document } from 'mongoose';

// Enum representing transaction types
const TransactionType =  {
  FUNDING: 'FUNDING',
  MONEY_TRANSFER: 'MONEY_TRANSFER',
}

const transactionSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: [TransactionType.FUNDING, TransactionType.MONEY_TRANSFER],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
  },
  recipients: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'User',
  },
  transactionReference: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const Transaction = mongoose.model('Transaction', transactionSchema);

export { Transaction, TransactionType };