@echo off
echo Starting Kofuku Room Booking Development Server...
set NODE_ENV=development
echo Environment: %NODE_ENV%
echo Server will be available at http://localhost:5000
npx tsx server/index.ts