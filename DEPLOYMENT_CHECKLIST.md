# Local Deployment Checklist

## ✅ Completed Migrations

### Removed Replit Dependencies
- ❌ Removed `@replit/vite-plugin-cartographer`
- ❌ Removed `@replit/vite-plugin-runtime-error-modal`  
- ❌ Removed `@neondatabase/serverless`
- ❌ Removed Replit authentication system
- ❌ Removed `.replit` configuration file
- ❌ Removed Replit development banner from HTML

### Added Local Dependencies
- ✅ Added `pg` (PostgreSQL driver)
- ✅ Added `bcryptjs` (password hashing)
- ✅ Added local authentication with Passport.js
- ✅ Updated to use `drizzle-orm/node-postgres`

### Database Changes
- ✅ Updated database connection to use local PostgreSQL
- ✅ Added `passwordHash` field to users table
- ✅ Updated user schema for local authentication
- ✅ Maintained all existing functionality

### Authentication Changes
- ✅ Replaced Replit OAuth with email/password authentication
- ✅ Added user registration and login endpoints
- ✅ Maintained admin/employee role system
- ✅ Session management with PostgreSQL store

## 🚀 Local Setup Steps

### 1. Prerequisites
```bash
# Ensure you have:
- Node.js 18+
- PostgreSQL 12+ running locally
- Git
```

### 2. Quick Setup
```bash
# Clone and setup
git clone <your-repo>
cd room-booking-system

# Run automated setup
npm run setup

# This will:
# - Install dependencies
# - Create .env file from template
# - Show setup instructions
```

### 3. Database Setup
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE room_booking_db;

# Create user (optional)
CREATE USER room_booking_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE room_booking_db TO room_booking_user;
```

### 4. Environment Configuration
Edit `.env` file:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/room_booking_db
SESSION_SECRET=your-super-secret-session-key-change-this
NODE_ENV=development
PORT=5000

# Optional: Email notifications
SENDGRID_API_KEY=your-sendgrid-api-key
FROM_EMAIL=noreply@yourdomain.com
```

### 5. Initialize Database Schema
```bash
npm run db:push
```

### 6. Start Development Server
```bash
npm run dev
```

### 7. Create Admin User
1. Go to `http://localhost:5000`
2. Register with email: `shlokebinani@gmail.com` (auto-admin)
3. Any other email will be regular employee

## 📋 Production Deployment

### Build for Production
```bash
npm run build
export NODE_ENV=production
npm start
```

### Environment Variables for Production
```env
DATABASE_URL=postgresql://user:pass@host:port/db
SESSION_SECRET=secure-random-string
NODE_ENV=production
PORT=5000
```

## 🔧 Available Commands

- `npm run setup` - Run setup wizard
- `npm run dev` - Start development server  
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run check` - TypeScript type checking
- `npm run db:push` - Push schema to database

## 🎯 Key Features Maintained

- ✅ Room booking and management
- ✅ User authentication and authorization
- ✅ Admin dashboard
- ✅ Email notifications (with SendGrid)
- ✅ Priority booking requests
- ✅ Real-time availability checking
- ✅ Responsive UI with Tailwind CSS

## 🔒 Security Features

- ✅ Password hashing with bcryptjs
- ✅ Session management with PostgreSQL
- ✅ CSRF protection
- ✅ Role-based access control
- ✅ Secure cookie settings

## 📊 Database Schema

All original tables maintained:
- `sessions` - User sessions
- `users` - User accounts (now with passwordHash)
- `rooms` - Available rooms
- `bookings` - Room reservations
- `priority_requests` - Priority booking requests
- `admin_notifications` - Admin notifications
- `teams` - Team management

## 🆘 Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test connection
psql -U postgres -d room_booking_db -c "SELECT 1;"
```

### Port Issues
```bash
# If port 5000 is in use
export PORT=3000
npm run dev
```

### TypeScript Errors
```bash
npm run check
```

## 📞 Support

- Check `README.md` for detailed documentation
- All Replit dependencies removed successfully
- Local PostgreSQL setup required
- Email `shlokebinani@gmail.com` for admin access