-- Andrea Schulman Scheduling System Database Schema
-- PostgreSQL 15+ compatible

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table for authentication and profiles
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    timezone VARCHAR(50) DEFAULT 'America/New_York',
    preferred_language VARCHAR(10) DEFAULT 'en',
    is_admin BOOLEAN DEFAULT false,
    email_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Service types and pricing
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    service_type VARCHAR(50) NOT NULL CHECK (service_type IN ('one_on_one', 'group_program', 'hybrid_program')),
    price_cents INTEGER NOT NULL,
    duration_minutes INTEGER,
    max_participants INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Andrea's availability slots
CREATE TABLE availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Sunday, 6=Saturday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    timezone VARCHAR(50) NOT NULL DEFAULT 'Asia/Jerusalem',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Group session schedules
CREATE TABLE group_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id UUID REFERENCES services(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    start_time TIME NOT NULL,
    timezone VARCHAR(50) NOT NULL DEFAULT 'Asia/Jerusalem',
    duration_minutes INTEGER DEFAULT 90,
    max_participants INTEGER NOT NULL DEFAULT 20,
    current_participants INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- All bookings (one-on-one, group, hybrid)
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    service_id UUID REFERENCES services(id) ON DELETE CASCADE,
    group_session_id UUID REFERENCES group_sessions(id) ON DELETE SET NULL,
    booking_type VARCHAR(50) NOT NULL CHECK (booking_type IN ('one_on_one', 'group_program', 'hybrid_program')),
    scheduled_at TIMESTAMP, -- NULL for group programs with fixed dates
    timezone VARCHAR(50) NOT NULL,
    duration_minutes INTEGER,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    meeting_link VARCHAR(500),
    preparation_notes TEXT,
    cancellation_reason TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payment tracking
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    stripe_payment_intent_id VARCHAR(255) UNIQUE,
    amount_cents INTEGER NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'succeeded', 'failed', 'cancelled', 'refunded')),
    payment_method VARCHAR(50),
    failure_reason TEXT,
    refund_amount_cents INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Waitlist for group sessions
CREATE TABLE waitlist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    group_session_id UUID REFERENCES group_sessions(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    position INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'waiting' CHECK (status IN ('waiting', 'notified', 'expired', 'enrolled')),
    notified_at TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(group_session_id, position)
);

-- Email notifications queue
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    type VARCHAR(100) NOT NULL CHECK (type IN (
        'booking_confirmation', 
        'payment_success', 
        'session_reminder', 
        'cancellation', 
        'waitlist_notification',
        'welcome_email',
        'program_reminder'
    )),
    email_to VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
    attempts INTEGER DEFAULT 0,
    scheduled_for TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sent_at TIMESTAMP,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Program enrollments (for hybrid programs)
CREATE TABLE enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    service_id UUID REFERENCES services(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    completed_modules INTEGER[] DEFAULT '{}',
    access_expires_at TIMESTAMP,
    last_accessed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Q&A sessions for hybrid programs
CREATE TABLE qa_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id UUID REFERENCES services(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    scheduled_at TIMESTAMP NOT NULL,
    duration_minutes INTEGER DEFAULT 90,
    max_participants INTEGER DEFAULT 15,
    current_participants INTEGER DEFAULT 0,
    meeting_link VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Q&A session participants
CREATE TABLE qa_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    qa_session_id UUID REFERENCES qa_sessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    enrollment_id UUID REFERENCES enrollments(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'registered' CHECK (status IN ('registered', 'attended', 'cancelled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(qa_session_id, user_id)
);

-- Audit log for important actions
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Performance indexes
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_service_id ON bookings(service_id);
CREATE INDEX idx_bookings_scheduled_at ON bookings(scheduled_at);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_type_status ON bookings(booking_type, status);

CREATE INDEX idx_payments_booking_id ON payments(booking_id);
CREATE INDEX idx_payments_stripe_id ON payments(stripe_payment_intent_id);
CREATE INDEX idx_payments_status ON payments(status);

CREATE INDEX idx_group_sessions_start_date ON group_sessions(start_date);
CREATE INDEX idx_group_sessions_service_id ON group_sessions(service_id);

CREATE INDEX idx_waitlist_group_session ON waitlist(group_session_id, position);
CREATE INDEX idx_waitlist_status ON waitlist(status);

CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_scheduled ON notifications(scheduled_for);
CREATE INDEX idx_notifications_type ON notifications(type);

CREATE INDEX idx_enrollments_user_id ON enrollments(user_id);
CREATE INDEX idx_enrollments_service_id ON enrollments(service_id);

CREATE INDEX idx_qa_sessions_service_id ON qa_sessions(service_id);
CREATE INDEX idx_qa_sessions_scheduled ON qa_sessions(scheduled_at);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);

CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_action ON audit_log(action);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at);

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_availability_updated_at BEFORE UPDATE ON availability FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_group_sessions_updated_at BEFORE UPDATE ON group_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_waitlist_updated_at BEFORE UPDATE ON waitlist FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_enrollments_updated_at BEFORE UPDATE ON enrollments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_qa_sessions_updated_at BEFORE UPDATE ON qa_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_qa_participants_updated_at BEFORE UPDATE ON qa_participants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample data insertion
INSERT INTO services (name, service_type, price_cents, duration_minutes, max_participants) VALUES
('One-on-One Coaching Session', 'one_on_one', 15000, 60, 1),
('Building Emotional Maturity Group Program', 'group_program', 38700, NULL, 20),
('Hybrid Program: Recorded Content + Live Q&A', 'hybrid_program', 49700, NULL, 15);

-- Andrea's default availability (Jerusalem time)
INSERT INTO availability (day_of_week, start_time, end_time, timezone) VALUES
(1, '09:00:00', '17:00:00', 'Asia/Jerusalem'), -- Monday
(2, '09:00:00', '17:00:00', 'Asia/Jerusalem'), -- Tuesday
(3, '09:00:00', '17:00:00', 'Asia/Jerusalem'), -- Wednesday
(4, '09:00:00', '17:00:00', 'Asia/Jerusalem'), -- Thursday
(0, '14:00:00', '18:00:00', 'Asia/Jerusalem'); -- Sunday afternoon

-- Create admin user (password: AdminPass123!)
INSERT INTO users (email, password_hash, first_name, last_name, timezone, is_admin, email_verified) VALUES
('andrea@andreaschulman.com', '$2a$10$rOzJqQZQXQXQXQXQXQXQXu', 'Andrea', 'Schulman', 'Asia/Jerusalem', true, true);

-- Comments for documentation
COMMENT ON TABLE users IS 'User accounts with authentication and profile information';
COMMENT ON TABLE services IS 'Available services with pricing and configuration';
COMMENT ON TABLE bookings IS 'All booking records across service types';
COMMENT ON TABLE payments IS 'Payment tracking with Stripe integration';
COMMENT ON TABLE group_sessions IS 'Scheduled group program sessions';
COMMENT ON TABLE waitlist IS 'Waitlist management for full group sessions';
COMMENT ON TABLE notifications IS 'Email notification queue and tracking';
COMMENT ON TABLE enrollments IS 'Hybrid program enrollments and progress';
COMMENT ON TABLE qa_sessions IS 'Live Q&A sessions for hybrid programs';
COMMENT ON TABLE audit_log IS 'Audit trail for security and compliance';

COMMENT ON COLUMN bookings.scheduled_at IS 'NULL for group programs with fixed start dates';
COMMENT ON COLUMN payments.stripe_payment_intent_id IS 'Stripe PaymentIntent ID for tracking';
COMMENT ON COLUMN waitlist.position IS 'Position in waitlist queue (1-based)';
COMMENT ON COLUMN enrollments.completed_modules IS 'Array of completed module IDs';
COMMENT ON COLUMN enrollments.access_expires_at IS 'When access to content expires (6 months default)';