import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import addressRoutes from './routes/addressRoutes.js'


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// CORS Configuration
const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use('/api', authRoutes);
app.use("/api/addresses", addressRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});