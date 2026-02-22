import mongoose from "mongoose";


const verifyPaymentInfo = new mongoose.Schema({
  orderId: { type: String, required: true, ref: 'Order' },
  paymentId: { type: String },
  signature: { type: String },
  status: {
    type: String,
    enum: ['verified', 'failed']
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'upi', 'wallet', 'netbanking'],
    required: false
  },
  attemptCount: { type: Number, default: 1 },
  failureReason: { type: String },
  failureDetails: { type: Object },
  requestData: { type: Object }, // Store what was sent
  responseData: { type: Object }, // Store what was received
  verifiedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

const verifyPaymentDTO = mongoose.models.verifyPayment || mongoose.model('verifyPayment', verifyPaymentInfo);
export default verifyPaymentDTO;