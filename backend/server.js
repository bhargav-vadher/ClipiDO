import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import analyzeRouter from './routes/analyze.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/analyze', analyzeRouter);

app.get("/", (req, res) => {
    res.send("Backend is running!");
});

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

app.listen(5000, () => {
    console.log("Server running on port 5000");
});