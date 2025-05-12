import express, { json } from 'express';
import cors from 'cors';
import dotenv from 'dotenv'
dotenv.config()

const app = express();
app.use(cors());
app.use(json());

// Rutas
import authRoutes from './routes/authRoutes.mjs';
app.use('/auth', authRoutes);

const PORT = process.env.API_PORT || 3000;
app.listen(PORT, () => console.log(`API escuchando en http://localhost:${PORT}`));
