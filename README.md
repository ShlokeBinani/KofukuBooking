# Room Booking System

A modern room booking and management system built with React, Express.js, and PostgreSQL.

## Features

- 🏢 Room booking and management
- 👥 User authentication and role-based access
- 📅 Calendar-based booking interface
- ⚡ Real-time availability checking
- 🔔 Admin notifications for new users and priority requests
- 📊 Admin dashboard for managing users, rooms, and bookings
- 📱 Responsive design for desktop and mobile

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Radix UI
- **Backend**: Express.js, Node.js, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js with local strategy
- **Email**: SendGrid (optional)

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 12+ running locally
- Git

## Local Setup

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd room-booking-system
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up PostgreSQL database

Create a new PostgreSQL database:

```sql
-- Connect to PostgreSQL as superuser
psql -U postgres

-- Create database
CREATE DATABASE room_booking_db;

-- Create a user (optional, you can use postgres user)
CREATE USER room_booking_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE room_booking_db TO room_booking_user;
```

### 4. Configure environment variables

Copy the example environment file and update it:

```bash
cp .env.example .env
```

Edit `.env` with your actual values:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/room_booking_db
SESSION_SECRET=your-super-secret-session-key-change-this-in-production
NODE_ENV=development
PORT=5000

# Optional: Email configuration for notifications
SENDGRID_API_KEY=your-sendgrid-api-key
FROM_EMAIL=noreply@yourdomain.com
```

### 5. Set up database schema

Push the database schema:

```bash
npm run db:push
```

### 6. Start the development server

```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## Production Deployment

### 1. Build the application

```bash
npm run build
```

### 2. Set environment to production

```bash
export NODE_ENV=production
```

### 3. Start the production server

```bash
npm start
```

## Database Management

### Push schema changes to database

```bash
npm run db:push
```

### Generate migrations (if you make schema changes)

```bash
npx drizzle-kit generate
```

## User Management

### Creating the first admin user

1. Start the application
2. Go to `http://localhost:5000`
3. Register with the email `shlokebinani@gmail.com` (this email is set as admin in the code)
4. This user will automatically have admin privileges

### Regular user registration

Any other email will create a regular employee user. Admin users can manage roles through the admin dashboard.

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run check` - Type check TypeScript
- `npm run db:push` - Push database schema changes

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `SESSION_SECRET` | ✅ | Secret key for session encryption |
| `NODE_ENV` | ✅ | Environment (development/production) |
| `PORT` | ❌ | Server port (default: 5000) |
| `SENDGRID_API_KEY` | ❌ | SendGrid API key for email notifications |
| `FROM_EMAIL` | ❌ | From email address for notifications |

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   └── lib/           # Utilities and hooks
├── server/                 # Express backend
│   ├── auth.ts            # Authentication logic
│   ├── db.ts              # Database connection
│   ├── routes.ts          # API routes
│   ├── storage.ts         # Database operations
│   └── services/          # External services (email, etc.)
├── shared/                 # Shared types and schemas
│   └── schema.ts          # Database schema
└── package.json
```

## API Endpoints

### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - Login user
- `POST /api/logout` - Logout user
- `GET /api/me` - Get current user

### Bookings
- `GET /api/bookings` - Get all bookings
- `POST /api/bookings` - Create new booking
- `DELETE /api/bookings/:id` - Cancel booking

### Rooms
- `GET /api/rooms` - Get all rooms
- `POST /api/rooms` - Create room (admin only)
- `PUT /api/rooms/:id` - Update room (admin only)

### Admin
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/role` - Update user role
- `GET /api/admin/notifications` - Get admin notifications

## Troubleshooting

### Database connection issues

1. Ensure PostgreSQL is running: `sudo systemctl status postgresql`
2. Check if the database exists: `psql -U postgres -l`
3. Verify the DATABASE_URL format: `postgresql://username:password@host:port/database`

### Port already in use

If port 5000 is already in use, you can change it:

```bash
export PORT=3000
npm run dev
```

### TypeScript errors

Run type checking:

```bash
npm run check
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.