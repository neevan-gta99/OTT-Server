import mongoose from "mongoose";


const orderInfo = {
  orderId: { type: String, required: true, unique: true },
  userName: { type: String, required: true, ref: 'UserInfo' },
  amount: { type: Number, required: true },
  coins: { type: Number, required: true },
  currency: {type: String, required: true},
  orderCreated: { type: Boolean},
  details: {type: String, required: true},
  createdAt: { type: Date, default: Date.now }
};

const orderDTO = mongoose.models.Order || mongoose.model('Order', orderInfo);
export default orderDTO;