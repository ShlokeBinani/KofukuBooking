#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

console.log('📦 Creating deployment package...\n');

// List of files and directories to include in the package
const filesToCopy = [
  // Core application files
  'package.json',
  'package-lock.json',
  'tsconfig.json',
  'vite.config.ts',
  'drizzle.config.ts',
  'postcss.config.js',
  'tailwind.config.ts',
  'components.json',
  
  // Documentation
  'README.md',
  'DEPLOYMENT_CHECKLIST.md',
  '.env.example',
  
  // Setup script
  'setup.js',
  
  // Source directories
  'client/',
  'server/',
  'shared/',
  
  // Config files
  '.gitignore'
];

// Files to exclude
const excludePatterns = [
  'node_modules',
  '.git',
  'dist',
  '.env',
  '*.log',
  '.DS_Store'
];

function shouldExclude(filePath) {
  return excludePatterns.some(pattern => 
    filePath.includes(pattern) || filePath.includes('/.') || filePath.startsWith('.')
  );
}

console.log('✅ Files ready for deployment:\n');

filesToCopy.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`  📄 ${file}`);
  }
});

console.log('\n📋 Next Steps for Download:');
console.log('1. Copy all the files listed above to your laptop');
console.log('2. Make sure to copy the entire client/, server/, and shared/ directories');
console.log('3. Follow the setup instructions in README.md');
console.log('4. Don\'t forget to exclude node_modules, .git, and dist folders\n');

console.log('🎯 Essential files structure:');
console.log(`
room-booking-system/
├── client/           # React frontend
├── server/           # Express backend  
├── shared/           # Shared types/schemas
├── package.json      # Dependencies
├── setup.js          # Setup wizard
├── README.md         # Instructions
├── .env.example      # Environment template
└── ... (other config files)
`);

console.log('✨ Your updated room booking system is ready!');
console.log('📖 See DEPLOYMENT_CHECKLIST.md for complete setup guide');