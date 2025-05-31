# TikTok Affiliator Bot - Production Deployment Guide

## Prerequisites

- Ubuntu/WSL environment
- Node.js 18+ installed
- PM2 for process management
- Nginx (optional, for reverse proxy)

## Environment Setup

1. Create `.env` file in project root:
```env
NODE_ENV=production
PORT=5000
LOG_LEVEL=info
SESSION_SECRET=your-secure-session-secret
TIKTOK_EMAIL=your-tiktok-email
TIKTOK_PASSWORD=your-tiktok-password
```

2. Install production dependencies:
```bash
npm install --production
```

## Security Measures

1. Bot Protection:
- Uses Puppeteer stealth plugin
- Implements human-like behavior
- Manages sessions to avoid frequent logins

2. Server Security:
- Rate limiting enabled
- Helmet.js for security headers
- Compression for performance
- Error handling and sanitization

## Deployment Steps

1. Build the application:
```bash
npm run build
```

2. Install PM2 globally:
```bash
npm install -g pm2
```

3. Start with PM2:
```bash
pm2 start dist/index.js --name tiktok-affiliator
```

4. Monitor logs:
```bash
pm2 logs tiktok-affiliator
```

## Monitoring & Maintenance

1. Health Checks:
- Server status endpoint: /api/health
- Bot status endpoint: /api/bot/status

2. Logging:
- Activity logs stored in database
- Error logs with stack traces
- Performance metrics

3. Backup & Recovery:
- Regular session backups
- Database backups
- Error recovery procedures

## Troubleshooting

1. Common Issues:
- TikTok detection: Adjust stealth settings
- Rate limiting: Adjust delays
- Session expiry: Implement auto-refresh

2. Error Codes:
- ERR_BOT_INIT: Bot initialization failed
- ERR_LOGIN: Login/authentication failed
- ERR_NAVIGATION: Page navigation failed

## Production Checklist

- [ ] Environment variables set
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] Error handling implemented
- [ ] Logging configured
- [ ] Monitoring setup
- [ ] Backup procedures documented
- [ ] Recovery procedures tested
