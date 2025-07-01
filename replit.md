# Kofuku Room Booking System

## Overview

The Kofuku Room Booking System is a modern React TypeScript application designed for smart office space management. It features a voice-controlled room booking system with "Hey Kofi" activation, intelligent conflict resolution, and team-based collaboration. The system is built using a full-stack approach with React frontend, Express.js backend, and PostgreSQL database.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for fast development and building
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent design
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation
- **Voice Recognition**: Web Speech API integration with custom hooks

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: Replit Auth with OpenID Connect integration
- **Session Management**: Express sessions with PostgreSQL store
- **API Design**: RESTful API with proper error handling and validation

### Data Storage
- **Primary Database**: PostgreSQL (via Neon serverless)
- **ORM**: Drizzle ORM with schema-first approach
- **Session Storage**: PostgreSQL-backed session store
- **Schema Management**: Database migrations handled through Drizzle Kit

## Key Components

### Authentication System
- **Provider**: Replit Auth with OpenID Connect
- **Session Management**: Secure server-side sessions with PostgreSQL storage
- **Role-Based Access**: Employee and head roles with different permissions
- **User Management**: Automatic user creation and profile management

### Room Booking System
- **Core Features**: 
  - Voice-controlled booking with "Hey Kofi" activation
  - Real-time availability checking
  - Conflict detection and resolution
  - Team-based booking options
- **Booking Types**: Personal and team bookings
- **Conflict Resolution**: Priority request system for handling booking conflicts

### User Interface
- **Intuitive Design**: Clean and simple booking interface
- **Real-time Feedback**: Instant availability checking and status updates
- **Responsive Layout**: Optimized for desktop and mobile devices
- **Form Validation**: Comprehensive input validation and error handling

### Email Notification System
- **Booking Confirmations**: Automated email notifications for successful bookings
- **Priority Requests**: Email notifications for conflict resolution requests
- **Service**: Mock email service (ready for nodemailer integration)

## Data Flow

### User Authentication Flow
1. User accesses the application
2. Unauthenticated users are redirected to Replit Auth
3. Successful authentication creates/updates user profile
4. Session is established with PostgreSQL backing
5. User gains access to booking system

### Booking Creation Flow
1. User initiates booking (voice or form)
2. System validates availability in real-time
3. If available, booking is created and confirmation sent
4. If conflict exists, priority request system is triggered
5. Email notifications are sent to relevant parties

### Form-Based Booking Process
1. User accesses booking form interface
2. System validates input data in real-time
3. Availability checking provides instant feedback
4. If available, booking is created and confirmation sent
5. If conflict exists, priority request system is triggered

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem**: React 18, React DOM, TypeScript support
- **UI Components**: Radix UI primitives, shadcn/ui components
- **Styling**: Tailwind CSS with PostCSS processing
- **Form Management**: React Hook Form, Hookform Resolvers, Zod validation

### Backend Dependencies
- **Server Framework**: Express.js with TypeScript
- **Database**: Neon PostgreSQL, Drizzle ORM, connect-pg-simple
- **Authentication**: OpenID Client, Passport.js
- **Session Management**: Express Session with PostgreSQL store

### Development Tools
- **Build System**: Vite with React plugin
- **Type Safety**: TypeScript with strict configuration
- **Database Management**: Drizzle Kit for migrations
- **Development Experience**: Replit-specific plugins for enhanced development

## Deployment Strategy

### Development Environment
- **Local Development**: Vite dev server with hot module replacement
- **Database**: Neon PostgreSQL serverless instance
- **Session Storage**: PostgreSQL-backed sessions
- **Environment Variables**: DATABASE_URL, SESSION_SECRET, REPLIT_DOMAINS

### Production Build
- **Frontend**: Vite production build with optimizations
- **Backend**: ESBuild compilation to ESM format
- **Static Assets**: Served from dist/public directory
- **Database**: Production PostgreSQL via Neon

### Replit Integration
- **Development Mode**: Cartographer plugin for enhanced debugging
- **Runtime Errors**: Runtime error overlay for better development experience
- **Authentication**: Seamless Replit Auth integration
- **Database Provisioning**: Automatic Neon database setup

## Changelog

- July 01, 2025. Initial setup with voice and text-enabled room booking system
- July 01, 2025. Added royal blue/beige metallic theme with custom SVG logo
- July 01, 2025. Implemented real-time availability checking with dynamic status indicators
- July 01, 2025. Enhanced voice recognition with click activation and network error handling
- July 01, 2025. Implemented admin/employee role system with dedicated admin dashboard
- July 01, 2025. Changed theme from blue/white to blue/beige metallic color scheme
- July 01, 2025. Removed voice control features as requested by user

## Recent Changes

### User Interface Improvements
- Removed voice control features as requested by user
- Streamlined booking interface for simpler user experience
- Enhanced form-based booking with real-time validation

### Real-time Availability System
- Rooms now show live availability status when date/time is selected
- Added visual indicators: green checkmark (available), red X (unavailable), spinning clock (checking)
- Automatic availability checking when booking form fields change

### Admin/Employee System
- Implemented role-based authentication with automatic admin assignment for specific email
- Created comprehensive admin dashboard with user management, room management, and notifications
- Added admin routes for managing users, rooms, and system settings
- Implemented admin notifications for new user registrations and priority requests

### Visual Design Improvements
- Changed theme from blue/white to blue/beige metallic color scheme
- Created custom metallic SVG logo with royal blue gradient and beige accents
- Applied consistent royal blue/beige color scheme throughout the application
- Added floating animations and glass morphism effects
- Enhanced landing page with improved visual hierarchy

## User Preferences

Preferred communication style: Simple, everyday language.
Theme preference: Royal blue and beige with metallic accents and smooth animations.