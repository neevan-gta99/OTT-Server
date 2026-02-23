import mongoose from "mongoose";


const coinsTransactionInfo = new mongoose.Schema({
  userName: { type: String, required: true, ref: 'UserInfo' },
  orderId: { type: String, required: true },
  paymentId: { type: String },
  coins: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['success', 'failed']
  },
   paymentMethod: {
    type: String,
    enum: ['card', 'upi', 'wallet', 'netbanking'],
    required: false
  },
  description: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const coinsTransactionDTO = mongoose.models.Transaction || mongoose.model('CoinsTransaction', coinsTransactionInfo);
export default coinsTransactionDTO;