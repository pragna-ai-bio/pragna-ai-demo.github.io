import express, { json, urlencoded } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import connectDB from './config/connectDB.js';
import authRoutes from './routes/auth.js';
import analysisRoutes from './routes/analysis.js';
import patientRoutes from './routes/patients.js';
import researchRoutes from './routes/research.js';
import errorHandler from './middleware/errorHandler.js';
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();

// Serve static files
app.use(express.static('public'));

// Security Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});
app.use(limiter);

// Body parsing
app.use(json({ limit: '10mb' }));
app.use(urlencoded({ extended: true }));
app.use(cookieParser());

app.set('view engine', 'pug');
app.set('views', './views');

// Security headers
app.use((req, res, next) => {
    res.header('X-Content-Type-Options', 'nosniff');
    res.header('X-Frame-Options', 'DENY');
    res.header('X-XSS-Protection', '1; mode=block');
    next();
});

// Database connection
connectDB();

// Routes
app.use('/auth', authRoutes);
app.use('/analysis', analysisRoutes);
app.use('/patients', patientRoutes);
app.use('/research', researchRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'PragnaAI Backend Running',
        timestamp: new Date().toISOString()
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: '🚀 PragnaAI Cancer Diagnosis API',
        version: '1.0.0',
        disclaimer: '🔬 RESEARCH PROTOTYPE',
        endpoints: {
            auth: '/auth',
            analysis: '/analysis',
            patients: '/patients',
            research: '/research'
        }
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        status: 'error',
        message: 'Route not found'
    });
});

// Error middleware
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`
 PragnaAI Backend Server Started
 Port: ${PORT}
 Research Prototype Only
`);
});

export default app;
