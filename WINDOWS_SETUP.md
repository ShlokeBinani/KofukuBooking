# Windows Setup Guide 🪟

## Quick Fix for Your Current Issue

You're getting the `'NODE_ENV' is not recognized` error because Windows uses different environment variable syntax. 

**Solutions**: Try these options in order:

```powershell
# Option 1: Install cross-env package (recommended)
npm install
npm run dev

# Option 2: If cross-env still doesn't work, use Windows-specific script
npm run dev:windows

# Option 3: Use PowerShell script directly
.\dev.ps1

# Option 4: Use batch file
.\dev.bat
```

## Complete Windows Setup Steps

### 1. Prerequisites for Windows

#### Install Node.js
- Download from [nodejs.org](https://nodejs.org/) (LTS version 18+)
- Make sure to check "Add to PATH" during installation

#### Install PostgreSQL on Windows
Choose one option:

**Option A: PostgreSQL Installer (Recommended)**
1. Download from [postgresql.org](https://www.postgresql.org/download/windows/)
2. Run installer as Administrator
3. Set password for `postgres` user (remember this!)
4. Default port 5432 is fine
5. Install with default settings

**Option B: Using Chocolatey**
```powershell
# Install Chocolatey first (if not installed)
# Then install PostgreSQL
choco install postgresql
```

**Option C: Using Docker**
```powershell
# If you have Docker Desktop
docker run --name postgres-local -e POSTGRES_PASSWORD=yourpassword -p 5432:5432 -d postgres:13
```

### 2. PostgreSQL Setup on Windows

#### Start PostgreSQL Service
```powershell
# Check if PostgreSQL is running
Get-Service postgresql*

# Start if not running (run as Administrator)
Start-Service postgresql-x64-13  # or your version
```

#### Create Database
```powershell
# Open Command Prompt as Administrator and run:
cd "C:\Program Files\PostgreSQL\13\bin"  # adjust version path

# Connect to PostgreSQL
psql -U postgres

# In PostgreSQL prompt:
CREATE DATABASE room_booking_db;
CREATE USER room_booking_user WITH PASSWORD 'yourpassword';
GRANT ALL PRIVILEGES ON DATABASE room_booking_db TO room_booking_user;
\q
```

### 3. Project Setup

```powershell
# Navigate to your project folder
cd "C:\Users\shlok\kofukuroom\KofukuBooking"

# Install dependencies (includes cross-env for Windows compatibility)
npm install

# Run setup wizard
npm run setup

# This creates .env file - now edit it:
```

### 4. Configure .env File

Edit `.env` with your Windows paths and database info:

```env
# Database - adjust username/password as needed
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/room_booking_db

# Session secret - generate a secure random string
SESSION_SECRET=your-super-secret-session-key-change-this-in-production

# Application settings
NODE_ENV=development
PORT=5000

# Optional: Email configuration
SENDGRID_API_KEY=your-sendgrid-api-key
FROM_EMAIL=noreply@yourdomain.com
```

### 5. Initialize and Start

```powershell
# Push database schema
npm run db:push

# Start development server
npm run dev

# Open browser to http://localhost:5000
```

## Windows-Specific Troubleshooting

### Issue: PostgreSQL Connection Fails
```powershell
# Check if PostgreSQL is running
Get-Service postgresql*

# Check if port 5432 is open
netstat -an | findstr 5432

# Test connection
psql -U postgres -h localhost -p 5432
```

### Issue: Permission Denied
```powershell
# Run PowerShell as Administrator
# Or add your user to PostgreSQL group in User Management
```

### Issue: PATH Issues
```powershell
# Add PostgreSQL to PATH permanently
$env:PATH += ";C:\Program Files\PostgreSQL\13\bin"

# Or add through System Properties > Environment Variables
```

### Issue: Port Already in Use
```powershell
# Find what's using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID with actual number)
taskkill /F /PID <PID>

# Or use different port
$env:PORT = "3000"
npm run dev
```

## Windows Development Tips

### Use Windows Terminal (Recommended)
- Install from Microsoft Store
- Better PowerShell experience
- Supports multiple tabs

### Alternative: Use Git Bash
- Comes with Git for Windows
- Unix-like commands work
- Better compatibility with npm scripts

### Using VS Code
```powershell
# Install VS Code extensions
code --install-extension ms-vscode.vscode-typescript-next
code --install-extension bradlc.vscode-tailwindcss
```

## Production Deployment on Windows

### Using Windows Server
```powershell
# Build for production
npm run build

# Set production environment
$env:NODE_ENV = "production"

# Start production server
npm start
```

### Using IIS (Internet Information Services)
1. Install iisnode module
2. Configure web.config for Node.js
3. Set up reverse proxy

### Using Docker on Windows
```dockerfile
# Dockerfile works same on Windows
docker build -t room-booking .
docker run -p 5000:5000 room-booking
```

## Common Windows Commands

```powershell
# Check Node.js version
node --version

# Check npm version
npm --version

# Clear npm cache
npm cache clean --force

# Reinstall node_modules
Remove-Item -Recurse -Force node_modules
npm install

# View environment variables
Get-ChildItem Env:

# Set environment variable temporarily
$env:DATABASE_URL = "postgresql://..."
```

## Security Considerations for Windows

1. **Firewall**: Allow Node.js through Windows Firewall
2. **Antivirus**: Add project folder to exclusions
3. **User Account Control**: Run development tools as regular user
4. **Database Security**: Don't use default passwords in production

## Success Verification

After setup, you should see:
```
✅ PostgreSQL running on port 5432
✅ Database 'room_booking_db' created
✅ npm run dev starts without errors
✅ http://localhost:5000 loads the login page
✅ Can register and login with email/password
```

## Need Help?

- Check Event Viewer for Windows system errors
- Use `npm run check` for TypeScript errors
- Check PostgreSQL logs in `C:\Program Files\PostgreSQL\13\data\log`
- Use Process Monitor to debug file/registry access issues

Your room booking system is now Windows-ready! 🎉