// Andrea Schulman Scheduling System - Backend Server
// Node.js/Express API with PostgreSQL, Redis, and Stripe integration

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const { Pool } = require('pg');
const redis = require('redis');
const stripe = require('stripe');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment-timezone');
require('dotenv').config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Database connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Redis connection
const redisClient = redis.createClient({
    url: process.env.REDIS_URL
});

redisClient.on('error', (err) => {
    console.error('Redis Client Error:', err);
});

redisClient.connect();

// Stripe initialization
const stripeClient = stripe(process.env.STRIPE_SECRET_KEY);

// Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://js.stripe.com"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "https://api.stripe.com"]
        }
    }
}));

app.use(compression());
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: 'Too many requests from this IP'
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: parseInt(process.env.AUTH_RATE_LIMIT_MAX) || 5,
    message: 'Too many authentication attempts'
});

app.use('/api/', limiter);
app.use('/api/auth/', authLimiter);

// Body parsing middleware
app.use('/webhook/stripe', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Authentication middleware
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await pool.query('SELECT * FROM users WHERE id = $1', [decoded.userId]);
        
        if (user.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        req.user = user.rows[0];
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Invalid token' });
    }
};

// Admin middleware
const requireAdmin = (req, res, next) => {
    if (!req.user.is_admin) {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
};

// Health check endpoint
app.get('/api/health', async (req, res) => {
    const health = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        services: {}
    };

    try {
        // Check database
        await pool.query('SELECT NOW()');
        health.services.database = { status: 'healthy' };
    } catch (error) {
        health.services.database = { status: 'unhealthy', error: error.message };
        health.status = 'degraded';
    }

    try {
        // Check Redis
        await redisClient.ping();
        health.services.redis = { status: 'healthy' };
    } catch (error) {
        health.services.redis = { status: 'unhealthy', error: error.message };
        health.status = 'degraded';
    }

    try {
        // Check Stripe
        await stripeClient.accounts.retrieve();
        health.services.stripe = { status: 'healthy' };
    } catch (error) {
        health.services.stripe = { status: 'unhealthy', error: error.message };
        health.status = 'degraded';
    }

    const statusCode = health.status === 'ok' ? 200 : 503;
    res.status(statusCode).json(health);
});

// Authentication routes
app.post('/api/auth/register', async (req, res) => {
    try {
        const { firstName, lastName, email, password, timezone } = req.body;

        // Validate input
        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        if (password.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters' });
        }

        // Check if user exists
        const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Create user
        const result = await pool.query(
            `INSERT INTO users (first_name, last_name, email, password_hash, timezone) 
             VALUES ($1, $2, $3, $4, $5) RETURNING id, first_name, last_name, email, timezone`,
            [firstName, lastName, email, passwordHash, timezone || 'America/New_York']
        );

        const user = result.rows[0];

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );

        res.status(201).json({
            message: 'User created successfully',
            user: {
                id: user.id,
                firstName: user.first_name,
                lastName: user.last_name,
                email: user.email,
                timezone: user.timezone
            },
            token
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Find user
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = result.rows[0];

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );

        res.json({
            message: 'Login successful',
            user: {
                id: user.id,
                firstName: user.first_name,
                lastName: user.last_name,
                email: user.email,
                timezone: user.timezone,
                isAdmin: user.is_admin
            },
            token
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Services routes
app.get('/api/services', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM services WHERE is_active = true ORDER BY service_type'
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Services fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch services' });
    }
});

// Availability routes
app.get('/api/availability', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM availability WHERE is_active = true ORDER BY day_of_week, start_time'
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Availability fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch availability' });
    }
});

// Booked slots routes
app.get('/api/booked-slots', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT scheduled_at FROM bookings 
             WHERE status IN ('confirmed', 'pending') 
             AND scheduled_at > NOW() 
             ORDER BY scheduled_at`
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Booked slots fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch booked slots' });
    }
});

// Booking routes
app.post('/api/bookings', authenticateToken, async (req, res) => {
    try {
        const { serviceId, scheduledAt, timezone, notes } = req.body;
        const userId = req.user.id;

        // Validate service
        const service = await pool.query('SELECT * FROM services WHERE id = $1', [serviceId]);
        if (service.rows.length === 0) {
            return res.status(400).json({ error: 'Invalid service' });
        }

        const serviceData = service.rows[0];

        // Create booking
        const result = await pool.query(
            `INSERT INTO bookings (user_id, service_id, booking_type, scheduled_at, timezone, notes)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [userId, serviceId, serviceData.service_type, scheduledAt, timezone, notes]
        );

        const booking = result.rows[0];

        res.status(201).json({
            message: 'Booking created successfully',
            booking: booking
        });
    } catch (error) {
        console.error('Booking creation error:', error);
        res.status(500).json({ error: 'Failed to create booking' });
    }
});

// Payment routes
app.post('/api/create-payment-intent', authenticateToken, async (req, res) => {
    try {
        const { serviceId, bookingId } = req.body;

        // Get service details
        const service = await pool.query('SELECT * FROM services WHERE id = $1', [serviceId]);
        if (service.rows.length === 0) {
            return res.status(400).json({ error: 'Invalid service' });
        }

        const serviceData = service.rows[0];

        // Create Stripe payment intent
        const paymentIntent = await stripeClient.paymentIntents.create({
            amount: serviceData.price_cents,
            currency: 'usd',
            metadata: {
                serviceId: serviceId,
                bookingId: bookingId,
                userId: req.user.id
            }
        });

        // Store payment record
        await pool.query(
            `INSERT INTO payments (booking_id, stripe_payment_intent_id, amount_cents, currency)
             VALUES ($1, $2, $3, $4)`,
            [bookingId, paymentIntent.id, serviceData.price_cents, 'USD']
        );

        res.json({
            clientSecret: paymentIntent.client_secret,
            amount: serviceData.price_cents
        });
    } catch (error) {
        console.error('Payment intent creation error:', error);
        res.status(500).json({ error: 'Failed to create payment intent' });
    }
});

// Stripe webhook handler
app.post('/webhook/stripe', async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripeClient.webhooks.constructEvent(
            req.body, 
            sig, 
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.log(`Webhook signature verification failed.`, err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
        switch (event.type) {
            case 'payment_intent.succeeded':
                await handlePaymentSuccess(event.data.object);
                break;
            case 'payment_intent.payment_failed':
                await handlePaymentFailure(event.data.object);
                break;
            default:
                console.log(`Unhandled event type ${event.type}`);
        }

        res.json({ received: true });
    } catch (error) {
        console.error('Webhook handling error:', error);
        res.status(500).json({ error: 'Webhook handling failed' });
    }
});

// Payment success handler
async function handlePaymentSuccess(paymentIntent) {
    try {
        // Update payment status
        await pool.query(
            'UPDATE payments SET status = $1 WHERE stripe_payment_intent_id = $2',
            ['succeeded', paymentIntent.id]
        );

        // Update booking status
        const booking = await pool.query(
            `UPDATE bookings SET status = 'confirmed' 
             WHERE id = (SELECT booking_id FROM payments WHERE stripe_payment_intent_id = $1)
             RETURNING *`,
            [paymentIntent.id]
        );

        if (booking.rows.length > 0) {
            // Send confirmation email (implement email service)
            console.log('Payment successful for booking:', booking.rows[0].id);
        }
    } catch (error) {
        console.error('Payment success handling error:', error);
    }
}

// Payment failure handler
async function handlePaymentFailure(paymentIntent) {
    try {
        await pool.query(
            'UPDATE payments SET status = $1 WHERE stripe_payment_intent_id = $2',
            ['failed', paymentIntent.id]
        );

        console.log('Payment failed for intent:', paymentIntent.id);
    } catch (error) {
        console.error('Payment failure handling error:', error);
    }
}

// Admin routes
app.get('/api/admin/bookings', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT b.*, u.first_name, u.last_name, u.email, s.name as service_name,
                   p.status as payment_status, p.amount_cents
            FROM bookings b
            JOIN users u ON b.user_id = u.id
            JOIN services s ON b.service_id = s.id
            LEFT JOIN payments p ON b.id = p.booking_id
            ORDER BY b.created_at DESC
        `);
        
        res.json(result.rows);
    } catch (error) {
        console.error('Admin bookings fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch bookings' });
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Andrea Schulman Scheduling API running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully');
    await pool.end();
    await redisClient.quit();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down gracefully');
    await pool.end();
    await redisClient.quit();
    process.exit(0);
});

module.exports = app;