# TikTok Affiliate Bot for Digi4U - Replit Documentation

## Overview

This is a sophisticated web automation application built for Digi4U (UK) to automate the TikTok affiliate creator invitation process. The system combines a React frontend with an Express.js backend, utilizing Puppeteer for web automation and PostgreSQL for data persistence.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack Query (React Query) for server state
- **UI Framework**: Custom component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom theme system
- **Build Tool**: Vite with hot module replacement

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Database**: PostgreSQL with Drizzle ORM
- **Web Automation**: Puppeteer with stealth plugins for TikTok interaction
- **Session Management**: PostgreSQL-based session storage
- **API Design**: RESTful endpoints for bot control and data management

### Database Schema
- **users**: User authentication and management
- **bot_sessions**: Track automation session states and metrics
- **creators**: Store TikTok creator information and invite history
- **activities**: Log all bot actions and system events
- **bot_config**: Store automation parameters and settings

## Key Components

### Bot Automation System
- **SessionManager**: Orchestrates bot sessions and handles state transitions
- **PuppeteerManager**: Manages browser automation with anti-detection measures
- **CreatorFilter**: Filters creators based on follower count, category, and previous invites
- **ActivityLogger**: Comprehensive logging system for all bot activities
- **HumanBehavior**: Simulates human-like interactions to avoid detection

### Web Interface
- **Dashboard**: Real-time metrics and bot control interface
- **Settings**: Configuration for bot parameters, categories, and limits
- **Creators**: Management interface for creator database
- **Analytics**: Performance charts and success rate tracking
- **Activity Logs**: Detailed system activity monitoring

### Authentication & Security
- Session-based authentication with PostgreSQL storage
- Environment-based configuration for sensitive credentials
- Rate limiting and human-like delays to avoid detection
- Stealth mode Puppeteer configuration

## Data Flow

1. **User Configuration**: Users configure bot settings through the React frontend
2. **Session Initialization**: Backend creates new bot session and initializes Puppeteer
3. **TikTok Login**: Automated login to TikTok Seller portal using provided credentials
4. **Creator Discovery**: Bot navigates to creator invitation pages and discovers potential creators
5. **Filtering Process**: Creators are filtered based on configured criteria (followers, category, etc.)
6. **Invitation Process**: Bot sends invitations to qualified creators with human-like delays
7. **Activity Logging**: All actions are logged to database for monitoring and analytics
8. **Real-time Updates**: Frontend receives live updates via polling API endpoints

## External Dependencies

### Core Dependencies
- **Puppeteer**: Web automation and browser control
- **Drizzle ORM**: Type-safe database operations
- **TanStack Query**: Server state management
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first styling framework

### TikTok Integration
- **Target Platform**: TikTok Seller UK (seller-uk.tiktok.com)
- **Region**: GB (Great Britain)
- **Authentication**: Email/password based login
- **Rate Limiting**: Human-like delays (30-60 seconds between actions)

## Deployment Strategy

### Development Environment
- **Platform**: Replit with Node.js 20 runtime
- **Hot Reload**: Vite development server with HMR
- **Database**: PostgreSQL provisioned through Replit
- **Browser**: Chromium installed via Nix packages

### Production Deployment
- **Platform**: Render.com with auto-deployment
- **Build Process**: Vite build for frontend, esbuild for backend
- **Database**: Render PostgreSQL with connection pooling
- **Environment**: Production Node.js with optimized Puppeteer settings

### Configuration Management
- Environment variables for sensitive data (credentials, database URLs)
- Separate development and production configurations
- Docker-like environment with Nix package management

## Production Features

### Security Enhancements
- **Helmet Security**: CSP, HSTS, XSS protection, and comprehensive security headers
- **Rate Limiting**: API rate limiting (100 req/15min) and bot action limiting (10 req/min)
- **CORS Protection**: Production-ready CORS configuration for Replit domains
- **Input Validation**: Zod schema validation for all API endpoints
- **Error Handling**: Secure error responses without information leakage

### Performance Optimizations
- **Database Connection Pooling**: Optimized PostgreSQL connections
- **Request Logging**: Structured API request logging with timing
- **Body Size Limits**: 10MB request body limit protection
- **Environment Configuration**: Comprehensive production environment setup

### Authentication & Authorization
- Session-based authentication with PostgreSQL storage
- Environment-based configuration for sensitive credentials
- Human-like delays and stealth mode to avoid detection

## Changelog

- June 20, 2025: Replit migration completed
  - Successfully migrated from Replit Agent to standard Replit environment
  - Created PostgreSQL database with all required tables using Drizzle migrations
  - Installed system Chromium and configured Puppeteer for browser automation
  - Fixed cross-env dependency issue and verified application startup
  - Updated TikTok API authorization URLs for production (App ID: 7512649815700963329)
  - Added TikTok-themed UI styling with animated gradient background and custom components
  - Reorganized sidebar navigation with logical sections (Main, Configuration, Monitoring, Help)
  - Removed all placeholder/mock implementations and replaced with real database-driven data
  - Removed Digi4U Repair Administrator section from sidebar
  - Application now running successfully on localhost:5000 with full functionality
- June 14, 2025: Production migration completed
  - Added comprehensive security middleware (Helmet, rate limiting, CORS)
  - Implemented database connection pooling and error handling
  - Created production environment configuration
  - Added comprehensive README and deployment documentation
- June 14, 2025: Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.