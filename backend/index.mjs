import express, { json } from 'express';
import cors from 'cors';
import dotenv from 'dotenv'
dotenv.config()

const app = express();
app.use(cors({
    origin: 'http://localhost:4200'  
}));
app.use(json());

// Rutas
import authRoutes from './routes/authRoutes.mjs';
app.use('/auth', authRoutes);

import kartingRoutes from './routes/kartingRoutes.mjs';
app.use('/karting', kartingRoutes);

import adminRoutes from './routes/adminRoutes.mjs';
app.use('/admin', adminRoutes);

const PORT = process.env.API_PORT || 3000;
app.listen(PORT, () => console.log(`API escuchando en http://localhost:${PORT}`));
