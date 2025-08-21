-- Create database schema for gym management system
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Admin users table for authentication
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Employees table
CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    position VARCHAR(100) NOT NULL,
    salary DECIMAL(10,2) NOT NULL,
    hire_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fee records table
CREATE TABLE IF NOT EXISTS fee_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    fee_type VARCHAR(100) NOT NULL,
    due_date DATE NOT NULL,
    paid_date DATE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reminders table
CREATE TABLE IF NOT EXISTS reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    fee_record_id UUID REFERENCES fee_records(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reminder_type VARCHAR(50) DEFAULT 'payment' CHECK (reminder_type IN ('payment', 'general')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sessions table for authentication
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status);
CREATE INDEX IF NOT EXISTS idx_fee_records_employee_id ON fee_records(employee_id);
CREATE INDEX IF NOT EXISTS idx_fee_records_status ON fee_records(status);
CREATE INDEX IF NOT EXISTS idx_fee_records_due_date ON fee_records(due_date);
CREATE INDEX IF NOT EXISTS idx_reminders_employee_id ON reminders(employee_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);

-- Insert default admin user (password: admin123)
INSERT INTO admin_users (email, password_hash, name) 
VALUES ('admin@gym.com', '$2b$10$rOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqu', 'Admin User')
ON CONFLICT (email) DO NOTHING;

-- Insert sample employees
INSERT INTO employees (name, email, phone, position, salary, hire_date) VALUES
('John Smith', 'john@gym.com', '+1234567890', 'Personal Trainer', 3000.00, '2024-01-15'),
('Sarah Johnson', 'sarah@gym.com', '+1234567891', 'Fitness Instructor', 2800.00, '2024-02-01'),
('Mike Wilson', 'mike@gym.com', '+1234567892', 'Manager', 4500.00, '2023-12-01'),
('Emily Davis', 'emily@gym.com', '+1234567893', 'Receptionist', 2200.00, '2024-03-10'),
('David Brown', 'david@gym.com', '+1234567894', 'Maintenance', 2500.00, '2024-01-20')
ON CONFLICT (email) DO NOTHING;

-- Insert sample fee records
INSERT INTO fee_records (employee_id, amount, fee_type, due_date, status) 
SELECT 
    e.id,
    CASE 
        WHEN random() < 0.3 THEN 50.00
        WHEN random() < 0.6 THEN 75.00
        ELSE 100.00
    END,
    CASE 
        WHEN random() < 0.4 THEN 'Monthly Membership'
        WHEN random() < 0.7 THEN 'Training Fee'
        ELSE 'Equipment Fee'
    END,
    CURRENT_DATE + (random() * 60 - 30)::integer,
    CASE 
        WHEN random() < 0.3 THEN 'paid'
        WHEN random() < 0.7 THEN 'pending'
        ELSE 'overdue'
    END
FROM employees e
CROSS JOIN generate_series(1, 3) -- 3 fee records per employee
ON CONFLICT DO NOTHING;

-- Update overdue status based on due date
UPDATE fee_records 
SET status = 'overdue' 
WHERE due_date < CURRENT_DATE AND status = 'pending';
