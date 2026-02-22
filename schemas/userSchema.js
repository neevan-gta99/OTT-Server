import mongoose from "mongoose";

const userInfo = new mongoose.Schema({
    userName: { type: String, unique: true, required: true, trim: true },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    accessibleVideosIds: { type: [] },
    coins: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

const userDTO = mongoose.models.User || mongoose.model('User', userInfo);
export default userDTO;
