import app from './app.js';
import dotenv from 'dotenv';
import connectDB from './DB.js';
import redisConnection from './redis/connection.js';

dotenv.config();

const port = process.env.PORT || 8900;

let redisClient;

(async () => {
  redisClient = await redisConnection();
  await connectDB();
})();

app.listen(port,()=>{
    console.log(`Server is Running: localhost:${port}`);
})

export {redisClient};


