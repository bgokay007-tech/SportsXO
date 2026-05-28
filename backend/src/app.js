import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { CLIENT_URL } from './config/env.js';
import userRoutes from './routes/user.routes.js';

const app = express();

// Middlewares
app.use(helmet());
app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/users', userRoutes);
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'SportsXO API is running' });
});

import authRoutes from './routes/auth.routes.js';
app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        message: err.message || 'Internal server error',
    });
});

export default app;