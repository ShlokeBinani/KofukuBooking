#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('🚀 Room Booking System Setup\n');

// Check if .env file exists
if (!fs.existsSync('.env')) {
  console.log('📋 Creating .env file from template...');
  fs.copyFileSync('.env.example', '.env');
  console.log('✅ .env file created! Please edit it with your database credentials.\n');
} else {
  console.log('✅ .env file already exists.\n');
}

// Check Node.js version
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

if (majorVersion < 18) {
  console.log('❌ Node.js 18+ is required. Current version:', nodeVersion);
  process.exit(1);
}
console.log('✅ Node.js version check passed:', nodeVersion);

// Check if dependencies are installed
if (!fs.existsSync('node_modules')) {
  console.log('📦 Installing dependencies...');
  try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Dependencies installed successfully!\n');
  } catch (error) {
    console.log('❌ Failed to install dependencies');
    process.exit(1);
  }
} else {
  console.log('✅ Dependencies already installed.\n');
}

console.log('🗄️  Database Setup Instructions:');
console.log('1. Make sure PostgreSQL is running on your system');
console.log('2. Create a database (e.g., room_booking_db)');
console.log('3. Update the DATABASE_URL in your .env file');
console.log('4. Run: npm run db:push');
console.log('5. Start the app: npm run dev\n');

console.log('🎯 Quick start commands:');
console.log('   npm run db:push    # Setup database schema');
console.log('   npm run dev        # Start development server');
console.log('   npm run build      # Build for production');
console.log('   npm start          # Start production server\n');

console.log('📚 For detailed instructions, see README.md');
console.log('🌐 App will be available at: http://localhost:5000');
console.log('\n✨ Setup complete! Happy coding!');