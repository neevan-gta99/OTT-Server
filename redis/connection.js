import { createClient } from "redis";
import dotenv from 'dotenv';

dotenv.config();    

let redisClient;

// singleton connection function
const redisConnection = async () => {
  if (!redisClient) {
    redisClient = createClient({ url: process.env.CONNECT_REDIS });
    redisClient.on("error", (err) => console.error("Redis Error:", err));
    await redisClient.connect();
    console.log("Redis connected successfully");
    console.log(redisClient);
  }
  return redisClient;
};

export default redisConnection;
