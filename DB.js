import mongoose from "mongoose";
import dotenv from 'dotenv';

dotenv.config();    

const connectDB = async ()=>{

try {
    await mongoose.connect(process.env.CONNECT_MONGO,{
      dbName: 'OttDemoDB',
    });
    console.log("MongoDB Server Connected");
  } catch (err) {
    console.error("DB connection error:", err);
  }

}

export default connectDB;
