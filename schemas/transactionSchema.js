import mongoose from "mongoose";


const transactionInfo = new mongoose.Schema({
  userName: { type: String, required: true, ref: 'UserInfo' },
  orderId: { type: String, required: true },
  paymentId: { type: String },
  coins: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['success', 'failed']
  },
  description: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const transactionDTO = mongoose.models.Transaction || mongoose.model('Transaction', transactionInfo);
export default transactionDTO;