# Andrea Schulman - Scheduling & Payment System

A comprehensive scheduling and payment platform for Andrea Schulman's educational programs, featuring three service types: one-on-one coaching, group programs, and hybrid programs with recorded content plus live Q&A sessions.

## 🌟 Features

### Service Types
- **One-on-One Coaching** ($150/hour) - Personal coaching sessions with calendar booking
- **Group Programs** ($387) - 6-week group programs with scheduled start dates and waitlist management
- **Hybrid Programs** ($497) - Self-paced recorded content + optional live Q&A sessions

### Key Functionality
- 📅 **Smart Scheduling** - Dual timezone support (Israel IST/IDT & US Eastern EST/EDT)
- 💳 **Stripe Integration** - Secure payment processing with multiple scenarios
- 📱 **Mobile-First Design** - Touch-optimized responsive interface
- 🔐 **User Authentication** - Secure login with JWT tokens
- 📧 **Email Automation** - Booking confirmations, reminders, and notifications
- 👥 **Waitlist Management** - Automatic enrollment when spots become available
- 📊 **Admin Dashboard** - Complete booking and payment management for Andrea
- 🧪 **Comprehensive Testing** - Unit, integration, and E2E tests

## 🏗️ Architecture

```
├── frontend/           # React-based frontend application
│   ├── public/         # Static assets and HTML
│   ├── src/           # Main application code
│   ├── components/    # Reusable UI components
│   ├── styles/        # CSS and styling files
│   └── utils/         # Utility functions
├── backend/           # Node.js/Express API server
│   ├── src/          # Main server code
│   ├── routes/       # API route handlers
│   ├── models/       # Database models
│   ├── middleware/   # Express middleware
│   ├── services/     # Business logic services
│   └── config/       # Configuration files
├── database/         # Database schemas and migrations
├── tests/           # Test suites
├── deployment/      # Docker and deployment configs
└── docs/           # Documentation
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- Stripe Account (for payments)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-username/emotional-maturity-program.git
cd emotional-maturity-program
```

2. **Install dependencies**
```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

3. **Environment Setup**
```bash
# Copy environment files
cp .env.example .env

# Configure your environment variables in .env
```

4. **Database Setup**
```bash
# Run database migrations
cd backend
npm run migrate

# Seed initial data
npm run seed
```

5. **Start Development Servers**
```bash
# Using Docker (recommended)
docker-compose up

# Or manually:
# Terminal 1 - Backend API
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

Visit `http://localhost:3000` to see the application.

## 🔧 Configuration

### Environment Variables

See `.env.example` for all available configuration options.

Key variables:
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `JWT_SECRET` - JWT signing secret
- `EMAIL_SERVICE_API_KEY` - Email service API key

## 📊 Database Schema

### Core Tables
- `users` - User authentication and profiles
- `services` - Service definitions and pricing
- `bookings` - All booking records with timezone support
- `payments` - Stripe payment tracking
- `group_sessions` - Group program schedules
- `availability` - Andrea's availability slots
- `waitlist` - Waitlist management for group sessions
- `notifications` - Email notification queue

## 🧪 Testing

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:e2e

# Run with coverage
npm run test:coverage
```

## 🚀 Deployment

### Production Deployment

```bash
# Build for production
docker-compose -f docker-compose.production.yml up -d

# Run migrations
docker-compose exec api npm run migrate
```

## 📱 Mobile Support

The application is built mobile-first with:
- Touch-optimized interface
- Responsive design for all screen sizes
- Mobile-specific navigation
- Touch gestures for calendar navigation

## 🔒 Security Features

- JWT-based authentication
- Rate limiting on API endpoints
- Input validation and sanitization
- HTTPS enforcement
- CORS configuration
- Security headers (Helmet.js)

## 🌍 Timezone Support

Supports dual timezone functionality:
- **Israel Time** (IST/IDT) - UTC+2/+3
- **US Eastern Time** (EST/EDT) - UTC-5/-4
- Automatic daylight saving time handling

## 📧 Email System

Automated email notifications for:
- Booking confirmations
- Payment receipts
- Session reminders (24 hours before)
- Waitlist notifications
- Cancellation notices

## 💳 Payment Integration

Stripe integration supports:
- Credit/debit card payments
- Payment failure handling
- Refund processing
- Webhook event handling
- PCI compliance

## 📈 Admin Features

Andrea's admin dashboard includes:
- Real-time booking overview
- Payment tracking and reporting
- Client management
- Calendar management
- Email notification monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Team

- **Andrea Schulman** - Educational Leader & Program Director
- **Development Team** - Full-stack development and architecture

## 📞 Support

For technical support or questions:
- Email: support@andreaschulman.com
- Issues: [GitHub Issues](https://github.com/your-username/andrea-schulman-scheduling/issues)

---

**Built with ❤️ for transforming lives through emotional maturity education**