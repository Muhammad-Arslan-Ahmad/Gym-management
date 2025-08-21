# Gym Management System

A comprehensive gym management system built with Next.js, TypeScript, and PostgreSQL. This application allows gym administrators to manage employees, track fee payments, and send reminders.

## Features

- **Employee Management**: Add, edit, delete, and search employees
- **Fee Tracking**: Manage fee records with different statuses (pending, paid, overdue)
- **Dashboard**: Overview of employees and fee statistics
- **Reminder System**: Track and manage payment reminders
- **Authentication**: Secure admin login system
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Server Actions
- **Database**: PostgreSQL
- **Authentication**: Custom session-based auth with bcrypt
- **Containerization**: Docker & Docker Compose

## Prerequisites

- Docker and Docker Compose installed on your machine
- Git (to clone the repository)

## Quick Start

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd gym-management-system
   \`\`\`

2. **Start the application with Docker**
   \`\`\`bash
   docker-compose up -d
   \`\`\`

   This will:
   - Start a PostgreSQL database container
   - Build and start the Next.js application
   - Initialize the database with sample data

3. **Access the application**
   - Open your browser and go to `http://localhost:3000`
   - Login with the default admin credentials:
     - Email: `admin@gym.com`
     - Password: `admin123`

## Development Setup

If you want to run the application in development mode:

1. **Install dependencies**
   \`\`\`bash
   npm install
   # or
   yarn install
   \`\`\`

2. **Start only the database**
   \`\`\`bash
   docker-compose up postgres -d
   \`\`\`

3. **Set environment variables**
   Create a `.env.local` file:
   \`\`\`env
   DATABASE_URL=postgresql://gym_admin:gym_password_2024@localhost:5432/gym_management
   \`\`\`

4. **Run the development server**
   \`\`\`bash
   npm run dev
   # or
   yarn dev
   \`\`\`

## Docker Commands

- **Start all services**: `docker-compose up -d`
- **Stop all services**: `docker-compose down`
- **View logs**: `docker-compose logs -f`
- **Rebuild and start**: `docker-compose up --build -d`
- **Stop and remove volumes**: `docker-compose down -v`

## Sample Data

The application comes with pre-populated sample data:

### Admin User
- **Email**: admin@gym.com
- **Password**: admin123

### Sample Employees
- 10 employees with different positions (Personal Trainers, Instructors, etc.)
- Various contact information and hire dates

### Sample Fee Records
- Multiple fee types (Certification, Training, Equipment, etc.)
- Different statuses (pending, paid, overdue)
- Realistic amounts and due dates

## Application Structure

\`\`\`
gym-management-system/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages
│   ├── login/            # Authentication pages
│   └── page.tsx          # Home page
├── components/            # Reusable React components
├── lib/                  # Utility functions and database
├── scripts/              # Database initialization scripts
├── docker-compose.yml    # Docker services configuration
├── Dockerfile           # Application container configuration
└── README.md           # This file
\`\`\`

## Key Features Walkthrough

### 1. Dashboard
- Overview of total employees and fee statistics
- Quick access to all major sections
- Real-time data from the database

### 2. Employee Management
- **View All Employees**: Searchable and filterable list
- **Add Employee**: Form to add new employees with validation
- **Edit Employee**: Update employee information
- **Delete Employee**: Remove employees with confirmation

### 3. Fee Tracking
- **View All Fees**: List of all fee records with employee information
- **Add Fee**: Create new fee records for employees
- **Mark as Paid**: Update payment status and record payment date
- **Filter by Status**: View pending, paid, or overdue fees

### 4. Authentication
- Secure login system with session management
- Password hashing with bcrypt
- Protected routes and API endpoints

## Database Schema

The application uses four main tables:

- **admin_users**: Admin authentication
- **employees**: Employee information
- **fee_records**: Fee tracking and payment status
- **reminders**: Payment reminder history
- **sessions**: User session management

## Environment Variables

- `DATABASE_URL`: PostgreSQL connection string
- `NODE_ENV`: Environment (development/production)

## Troubleshooting

### Database Connection Issues
\`\`\`bash
# Check if PostgreSQL container is running
docker-compose ps

# View database logs
docker-compose logs postgres

# Restart the database
docker-compose restart postgres
\`\`\`

### Application Issues
\`\`\`bash
# View application logs
docker-compose logs app

# Rebuild the application
docker-compose up --build app
\`\`\`

### Reset Database
\`\`\`bash
# Stop services and remove volumes
docker-compose down -v

# Start fresh
docker-compose up -d
\`\`\`

## Production Deployment

For production deployment:

1. Update environment variables for production
2. Use a managed PostgreSQL service
3. Configure proper SSL certificates
4. Set up monitoring and logging
5. Implement backup strategies

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
