-- Initialize the gym management database with tables and dummy data

-- Create admin users table
CREATE TABLE IF NOT EXISTS admin_users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create employees table
CREATE TABLE IF NOT EXISTS employees (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    position VARCHAR(100),
    salary DECIMAL(10,2),
    hire_date DATE,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create fee records table
CREATE TABLE IF NOT EXISTS fee_records (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    fee_type VARCHAR(100) NOT NULL,
    due_date DATE NOT NULL,
    paid_date DATE,
    status VARCHAR(20) DEFAULT 'pending',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create reminders table
CREATE TABLE IF NOT EXISTS reminders (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
    fee_record_id INTEGER REFERENCES fee_records(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reminder_type VARCHAR(50) DEFAULT 'payment_due'
);

-- Create sessions table for authentication
CREATE TABLE IF NOT EXISTS sessions (
    id SERIAL PRIMARY KEY,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    admin_user_id INTEGER REFERENCES admin_users(id) ON DELETE CASCADE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin user (password: admin123)
INSERT INTO admin_users (email, password_hash, name) VALUES 
('admin@gym.com', '$2b$10$rOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqu', 'Gym Administrator')
ON CONFLICT (email) DO NOTHING;

-- Insert dummy employees
INSERT INTO employees (name, email, phone, position, salary, hire_date, status) VALUES 
('John Smith', 'john.smith@email.com', '+1-555-0101', 'Personal Trainer', 45000.00, '2023-01-15', 'active'),
('Sarah Johnson', 'sarah.johnson@email.com', '+1-555-0102', 'Fitness Instructor', 38000.00, '2023-02-20', 'active'),
('Mike Davis', 'mike.davis@email.com', '+1-555-0103', 'Gym Manager', 55000.00, '2022-11-10', 'active'),
('Emily Wilson', 'emily.wilson@email.com', '+1-555-0104', 'Nutritionist', 42000.00, '2023-03-05', 'active'),
('David Brown', 'david.brown@email.com', '+1-555-0105', 'Personal Trainer', 44000.00, '2023-04-12', 'active'),
('Lisa Garcia', 'lisa.garcia@email.com', '+1-555-0106', 'Yoga Instructor', 36000.00, '2023-05-18', 'active'),
('Tom Anderson', 'tom.anderson@email.com', '+1-555-0107', 'Maintenance Staff', 32000.00, '2023-06-22', 'active'),
('Jessica Martinez', 'jessica.martinez@email.com', '+1-555-0108', 'Front Desk', 28000.00, '2023-07-30', 'active'),
('Robert Taylor', 'robert.taylor@email.com', '+1-555-0109', 'Personal Trainer', 46000.00, '2023-08-15', 'active'),
('Amanda White', 'amanda.white@email.com', '+1-555-0110', 'Group Fitness Instructor', 39000.00, '2023-09-01', 'active')
ON CONFLICT (email) DO NOTHING;

-- Insert dummy fee records
INSERT INTO fee_records (employee_id, amount, fee_type, due_date, status, description) VALUES 
(1, 150.00, 'Certification Fee', '2024-01-15', 'pending', 'Annual personal training certification renewal'),
(2, 75.00, 'Uniform Fee', '2024-01-20', 'paid', 'New gym uniform and equipment'),
(3, 200.00, 'Training Fee', '2024-02-01', 'pending', 'Management training course fee'),
(4, 125.00, 'License Fee', '2024-01-25', 'overdue', 'Nutritionist license renewal'),
(5, 150.00, 'Certification Fee', '2024-02-10', 'pending', 'Personal training certification'),
(6, 100.00, 'Equipment Fee', '2024-01-30', 'paid', 'Yoga equipment and props'),
(7, 50.00, 'Safety Training', '2024-02-05', 'pending', 'Workplace safety training fee'),
(8, 25.00, 'ID Badge Fee', '2024-01-18', 'paid', 'Replacement ID badge'),
(9, 175.00, 'Advanced Certification', '2024-02-15', 'pending', 'Advanced personal training certification'),
(10, 80.00, 'Workshop Fee', '2024-01-28', 'overdue', 'Group fitness workshop attendance fee');

-- Update paid_date for paid records
UPDATE fee_records SET paid_date = '2024-01-18' WHERE status = 'paid' AND id = 2;
UPDATE fee_records SET paid_date = '2024-01-25' WHERE status = 'paid' AND id = 6;
UPDATE fee_records SET paid_date = '2024-01-16' WHERE status = 'paid' AND id = 8;

-- Insert dummy reminders
INSERT INTO reminders (employee_id, fee_record_id, message, reminder_type) VALUES 
(4, 4, 'Your nutritionist license renewal fee of $125.00 is overdue. Please pay immediately to avoid penalties.', 'overdue_payment'),
(10, 10, 'Your group fitness workshop fee of $80.00 is overdue. Please contact the admin office.', 'overdue_payment'),
(1, 1, 'Reminder: Your certification fee of $150.00 is due on January 15, 2024.', 'payment_due'),
(3, 3, 'Your management training course fee of $200.00 is due soon. Please arrange payment.', 'payment_due');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status);
CREATE INDEX IF NOT EXISTS idx_fee_records_status ON fee_records(status);
CREATE INDEX IF NOT EXISTS idx_fee_records_employee_id ON fee_records(employee_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
