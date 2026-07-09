> [!IMPORTANT]
> **This repository is superseded.** The canonical platform is
> [`Schulman-Coaching/andrea-schulman-coaching-platform`](https://github.com/Schulman-Coaching/andrea-schulman-coaching-platform).
> New product work and bug fixes should be made there.
>
> Scheduling, timezone, waitlist, and notification concepts are tracked as migration issues in the canonical repository.
>
> This repository is retained temporarily for migration review and historical
> reference. It can be archived after the canonical migration is deployed and
> verified.

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

#### Prerequisites

Before installing, ensure you have the following installed on your system:

- **Node.js 18+** - [Download from nodejs.org](https://nodejs.org/)
- **npm 8+** (comes with Node.js)
- **PostgreSQL 15+** - [Download from postgresql.org](https://www.postgresql.org/download/)
- **Redis 7+** - [Download from redis.io](https://redis.io/download)
- **Git** - [Download from git-scm.com](https://git-scm.com/)

**Optional but recommended:**
- **Docker & Docker Compose** - [Download from docker.com](https://www.docker.com/get-started)

#### Quick Setup with Docker (Recommended)

1. **Clone the repository**
```bash
git clone https://github.com/your-username/andrea-schulman-scheduling.git
cd andrea-schulman-scheduling
```

2. **Environment Setup**
```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your configuration
# At minimum, update these required variables:
# - STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
# - STRIPE_SECRET_KEY=sk_test_your_stripe_key
# - EMAIL_SERVICE_API_KEY=your_sendgrid_api_key
# - JWT_SECRET=your_secure_jwt_secret
```

3. **Start with Docker**
```bash
# Start all services (database, redis, backend, frontend)
docker-compose up

# Or run in background
docker-compose up -d
```

4. **Initialize Database**
```bash
# Run database migrations and seed data
docker-compose exec backend npm run migrate
docker-compose exec backend npm run seed
```

5. **Access the Application**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Database Admin**: http://localhost:8080 (Adminer)

#### Manual Setup (Alternative)

If you prefer not to use Docker or need more control:

1. **Clone and Setup**
```bash
git clone https://github.com/your-username/andrea-schulman-scheduling.git
cd andrea-schulman-scheduling
cp .env.example .env
```

2. **Configure Environment Variables**
Edit `.env` file with your settings:
```bash
# Database (ensure PostgreSQL is running)
DATABASE_URL=postgresql://postgres:password@localhost:5432/andrea_schulman_dev

# Redis (ensure Redis is running)
REDIS_URL=redis://localhost:6379

# Stripe (get from your Stripe dashboard)
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
STRIPE_SECRET_KEY=sk_test_your_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Email (SendGrid recommended)
EMAIL_SERVICE_API_KEY=your_sendgrid_api_key
EMAIL_FROM=noreply@yourdomain.com

# Security
JWT_SECRET=your_secure_random_jwt_secret_here
```

3. **Database Setup**
```bash
# Create database
createdb andrea_schulman_dev

# Import schema
psql -d andrea_schulman_dev -f database/schema.sql
```

4. **Install Dependencies**
```bash
# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ../frontend
npm install
```

5. **Run Database Migrations**
```bash
cd backend
npm run migrate
npm run seed
```

6. **Start Development Servers**
```bash
# Terminal 1 - Start backend API
cd backend
npm run dev

# Terminal 2 - Start frontend
cd frontend
npm start
```

#### Third-Party Service Setup

**Stripe Configuration:**
1. Create a [Stripe account](https://stripe.com)
2. Get your test API keys from the Stripe Dashboard
3. Add keys to your `.env` file
4. Set up webhook endpoint: `http://localhost:3001/api/webhooks/stripe`

**Email Service (SendGrid):**
1. Create a [SendGrid account](https://sendgrid.com)
2. Generate an API key
3. Add to `.env` as `EMAIL_SERVICE_API_KEY`
4. Verify your sender email address

**Optional - AWS S3 (for file storage):**
1. Create AWS account and S3 bucket
2. Generate access keys
3. Add AWS credentials to `.env`

#### Verification Steps

1. **Check Backend API**
```bash
curl http://localhost:3001/api/health
# Should return: {"status":"ok","timestamp":"..."}
```

2. **Check Database Connection**
```bash
cd backend
npm run migrate:status
# Should show migration status
```

3. **Check Frontend**
- Visit http://localhost:3000
- Should see the scheduling interface
- Check browser console for errors

4. **Test User Registration**
- Try creating a new user account
- Check email delivery (if configured)

#### Development Tools

**Database Management:**
- **Adminer**: http://localhost:8080 (if using Docker)
- **pgAdmin**: Install separately for advanced PostgreSQL management

**API Testing:**
```bash
# Install globally for API testing
npm install -g @apidevtools/swagger-parser

# View API documentation
curl http://localhost:3001/api/docs
```

**Running Tests:**
```bash
# Backend tests
cd backend
npm test
npm run test:coverage

# Frontend tests
cd frontend
npm test
npm run test:coverage

# End-to-end tests
npm run test:e2e
```

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

## 🔧 Troubleshooting

### Common Issues and Solutions

**1. Port Already in Use**
```bash
# Error: EADDRINUSE :::3000
# Solution: Kill processes using the ports
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9

# Or use different ports in .env
PORT=3002
FRONTEND_URL=http://localhost:3002
```

**2. Database Connection Issues**
```bash
# Error: connection to server at "localhost" (::1), port 5432 failed
# Solutions:

# Check if PostgreSQL is running
pg_ctl status

# Start PostgreSQL service
# macOS with Homebrew:
brew services start postgresql

# Ubuntu/Debian:
sudo systemctl start postgresql

# Windows:
net start postgresql-x64-15
```

**3. Redis Connection Issues**
```bash
# Error: Redis connection failed
# Solutions:

# Check if Redis is running
redis-cli ping
# Should return: PONG

# Start Redis service
# macOS with Homebrew:
brew services start redis

# Ubuntu/Debian:
sudo systemctl start redis-server

# Windows: Download and run Redis for Windows
```

**4. Node.js Version Issues**
```bash
# Error: Node.js version compatibility
# Solution: Use Node Version Manager (nvm)

# Install nvm (macOS/Linux)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Install and use Node.js 18
nvm install 18
nvm use 18
```

**5. npm Install Failures**
```bash
# Error: npm install fails with permission errors
# Solutions:

# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json
npm install

# Fix npm permissions (macOS/Linux)
sudo chown -R $(whoami) ~/.npm
```

**6. Docker Issues**
```bash
# Error: Docker daemon not running
# Solution: Start Docker Desktop or Docker service

# Error: Port conflicts in Docker
# Solution: Stop conflicting containers
docker ps
docker stop <container_id>

# Reset Docker environment
docker-compose down
docker system prune -f
docker-compose up --build
```

**7. Environment Variables Not Loading**
```bash
# Error: Environment variables undefined
# Solutions:

# Verify .env file exists and has correct format
ls -la .env
cat .env

# Ensure no spaces around = in .env
# Wrong: STRIPE_KEY = pk_test_123
# Right: STRIPE_KEY=pk_test_123

# Restart servers after .env changes
```

**8. Stripe Integration Issues**
```bash
# Error: Stripe key invalid
# Solutions:

# Verify keys are test keys (start with pk_test_ and sk_test_)
# Check Stripe dashboard for correct keys
# Ensure webhook endpoint is configured: http://localhost:3001/api/webhooks/stripe
```

**9. Email Service Issues**
```bash
# Error: Email sending fails
# Solutions:

# Verify SendGrid API key is valid
# Check sender email is verified in SendGrid
# Test email configuration:
curl -X POST http://localhost:3001/api/test-email
```

**10. Database Migration Errors**
```bash
# Error: Migration failed
# Solutions:

# Reset database
npm run db:reset

# Check database permissions
psql -d andrea_schulman_dev -c "SELECT current_user;"

# Manually run schema
psql -d andrea_schulman_dev -f database/schema.sql
```

### Getting Help

If you encounter issues not covered here:

1. **Check the logs:**
   ```bash
   # Backend logs
   cd backend && npm run dev
   
   # Frontend logs
   cd frontend && npm start
   
   # Docker logs
   docker-compose logs backend
   docker-compose logs frontend
   ```

2. **Enable debug mode:**
   ```bash
   # Add to .env
   DEBUG=app:*
   LOG_LEVEL=debug
   ```

3. **Create an issue:**
   - Visit: [GitHub Issues](https://github.com/your-username/andrea-schulman-scheduling/issues)
   - Include: OS, Node.js version, error messages, and steps to reproduce

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