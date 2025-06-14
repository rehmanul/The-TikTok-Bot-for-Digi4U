# TikTok Affiliate Bot for Digi4U

A sophisticated web automation application for automating TikTok affiliate creator invitations. Built with React, Express.js, and Puppeteer for reliable, production-ready automation.

## Features

- **Automated Creator Discovery**: Finds and filters TikTok creators based on follower count and categories
- **Smart Invitation System**: Sends invitations with human-like delays to avoid detection
- **Real-time Dashboard**: Monitor bot performance, success rates, and activity logs
- **Advanced Filtering**: Filter creators by followers, categories, and invitation history
- **Security First**: Rate limiting, helmet security headers, and CORS protection
- **Database Persistence**: PostgreSQL storage for all data and session management

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL database
- TikTok Seller account credentials

### Installation

1. Clone the repository
2. Copy `.env.example` to `.env` and configure your settings:
   ```bash
   cp .env.example .env
   ```

3. Set up your environment variables:
   ```env
   DATABASE_URL=your_postgresql_connection_string
   TIKTOK_EMAIL=your_tiktok_email
   TIKTOK_PASSWORD=your_tiktok_password
   ```

4. Install dependencies and initialize database:
   ```bash
   npm install
   npm run db:push
   ```

5. Start the application:
   ```bash
   npm run dev
   ```

## Production Deployment

### Environment Configuration

Required environment variables for production:

- `DATABASE_URL`: PostgreSQL connection string
- `TIKTOK_EMAIL`: TikTok Seller account email
- `TIKTOK_PASSWORD`: TikTok Seller account password
- `NODE_ENV=production`
- `SESSION_SECRET`: Random string for session encryption

### Security Features

- **Helmet**: Security headers including CSP, HSTS, and XSS protection
- **Rate Limiting**: API rate limiting (100 req/15min) and bot action limiting (10 req/min)
- **CORS**: Configured for production domains
- **Input Validation**: Zod schema validation for all API endpoints
- **Error Handling**: Comprehensive error logging and user-friendly error responses

### Performance Optimizations

- **Connection Pooling**: PostgreSQL connection pooling
- **Request Logging**: Structured API request logging
- **Body Size Limits**: 10MB request body limit protection
- **Database Indexing**: Optimized database queries with proper indexing

## API Endpoints

### Bot Control
- `GET /api/bot/status` - Get current bot status
- `POST /api/bot/start` - Start bot session
- `POST /api/bot/pause` - Pause current session
- `POST /api/bot/stop` - Stop current session

### Configuration
- `GET /api/bot/config` - Get bot configuration
- `PUT /api/bot/config` - Update bot settings

### Analytics
- `GET /api/dashboard/metrics` - Dashboard metrics
- `GET /api/activities` - Activity logs
- `GET /api/creators/stats` - Creator statistics

## Security Best Practices

1. **Environment Variables**: Never commit sensitive credentials
2. **Rate Limiting**: Built-in protection against abuse
3. **Input Validation**: All inputs validated with Zod schemas
4. **Security Headers**: Comprehensive security header configuration
5. **Error Handling**: Secure error responses without information leakage

## Architecture

- **Frontend**: React 18 with TypeScript, Wouter routing, TanStack Query
- **Backend**: Express.js with TypeScript, Drizzle ORM
- **Database**: PostgreSQL with connection pooling
- **Automation**: Puppeteer with stealth plugins
- **Security**: Helmet, CORS, rate limiting, input validation

## Support

For issues or questions, please contact the development team.

## License

Proprietary software for Digi4U (UK) Ltd.