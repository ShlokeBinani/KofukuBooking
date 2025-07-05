# PowerShell script to start development server on Windows
Write-Host "🚀 Starting Kofuku Room Booking Development Server..." -ForegroundColor Green

# Set environment variable for this session
$env:NODE_ENV = "development"

# Start the development server
Write-Host "Environment: $env:NODE_ENV" -ForegroundColor Cyan
Write-Host "Starting server on http://localhost:5000" -ForegroundColor Cyan

# Run the TypeScript server
npx tsx server/index.ts