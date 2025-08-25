-- Optional database seeding script - only inserts if data doesn't exist
-- Run this separately if you want to add sample data

-- Removed default admin seed. The first successful login creates the admin if none exists.

-- Insert sample employees only if employees table is empty
INSERT INTO employees (name, email, phone, position, salary, hire_date, status) 
SELECT * FROM (VALUES 
  ('John Smith', 'john.smith@email.com', '+1-555-0101', 'Personal Trainer', 45000.00, DATE '2023-01-15', 'active'),
  ('Sarah Johnson', 'sarah.johnson@email.com', '+1-555-0102', 'Fitness Instructor', 38000.00, DATE '2023-02-20', 'active'),
  ('Mike Davis', 'mike.davis@email.com', '+1-555-0103', 'Gym Manager', 55000.00, DATE '2022-11-10', 'active'),
  ('Emily Wilson', 'emily.wilson@email.com', '+1-555-0104', 'Nutritionist', 42000.00, DATE '2023-03-05', 'active'),
  ('David Brown', 'david.brown@email.com', '+1-555-0105', 'Personal Trainer', 44000.00, DATE '2023-04-12', 'active')
) AS sample_data(name, email, phone, position, salary, hire_date, status)
WHERE (SELECT COUNT(*) FROM employees) = 0;

-- Insert sample fee records only if fee_records table is empty
INSERT INTO fee_records (employee_id, amount, fee_type, due_date, status, description) 
SELECT employee_id, amount, fee_type, due_date, status, description
FROM (VALUES 
  (1, 150.00, 'Certification Fee', DATE '2024-01-15', 'pending', 'Annual personal training certification renewal'),
  (2, 75.00, 'Uniform Fee', DATE '2024-01-20', 'paid', 'New gym uniform and equipment'),
  (3, 200.00, 'Training Fee', DATE '2024-02-01', 'pending', 'Management training course fee'),
  (4, 125.00, 'License Fee', DATE '2024-01-25', 'overdue', 'Nutritionist license renewal'),
  (5, 150.00, 'Certification Fee', DATE '2024-02-10', 'pending', 'Personal training certification')
) AS sample_fees(employee_id, amount, fee_type, due_date, status, description)
WHERE (SELECT COUNT(*) FROM fee_records) = 0;

-- Update paid_date for paid records
UPDATE fee_records SET paid_date = DATE '2024-01-18' WHERE status = 'paid' AND paid_date IS NULL;
