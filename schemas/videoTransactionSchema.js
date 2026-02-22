import mongoose from "mongoose";

const videoTransaction = new mongoose.Schema({
  userName: { type: String, required: true },
  coins: { type: Number, required: true },
  status: { type: String, enum: ['success', 'failed'], required: true },
  videoTitle: { type: String, required: true },
  videoId: { type: String, required: true }
}, {
  timestamps: true
});

const VideoTransactionDTO = mongoose.models.VideoTransaction || mongoose.model('VideoTransaction', videoTransaction);

export default VideoTransactionDTO;