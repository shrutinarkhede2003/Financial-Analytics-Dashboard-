import mongoose, { Document, Schema } from 'mongoose';

export interface ITransaction extends Document {
  id: number;
  date: Date;
  amount: number;
  category: 'Revenue' | 'Expense';
  status: 'Paid' | 'Pending';
  user_id: string;
  user_profile: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const TransactionSchema: Schema = new Schema(
  {
    id: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['Revenue', 'Expense'],
      index: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['Paid', 'Pending'],
      index: true,
    },
    user_id: {
      type: String,
      required: true,
      index: true,
    },
    user_profile: {
      type: String,
      default: 'https://thispersondoesnotexist.com/',
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for optimal filtering and sorting performance
TransactionSchema.index({ category: 1, status: 1 });
TransactionSchema.index({ date: -1, amount: -1 });
TransactionSchema.index({ user_id: 1, date: -1 });

export const Transaction = mongoose.model<ITransaction>('Transaction', TransactionSchema);
