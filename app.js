import express from 'express'
import cookieParser from 'cookie-parser';
import cors from 'cors';
import users from './routes/userRoutes.js'

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser()); 
app.use(express.urlencoded({ extended: true }));

app.use(cors({              
  origin: ['http://localhost:5174', "https://ott-client-coral.vercel.app/"],
  credentials: true
}));


app.use('/api/users',users);



export default app;
