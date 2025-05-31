# TikTok Affiliate Bot Created by Digi4U_RDEV

An automated tool for managing TikTok Shop affiliate invitations with human-like behavior.

## Features

- Automated login and session management
- Creator filtering by followers count and categories
- Automated affiliate invitation sending
- Rate limiting and human-like delays
- Activity logging and monitoring
- Web dashboard for configuration and monitoring

## Prerequisites

- Node.js 16+ 
- npm or yarn
- Chrome/Chromium browser

## Installation

1. Clone the repository:
```bash
git clone https://github.com/rehmanul/TikTok-Affiliate-Bot.git
cd TikTok-Affiliate-Bot
```

2. Install dependencies:
```bash
# Install server dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..
```

3. Create a .env file in the root directory:
```env
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:5173
TIKTOK_EMAIL=your-email@example.com
TIKTOK_PASSWORD=your-password
```

## Usage

1. Start the development servers:

```bash
# Start backend server
npm run dev:server

# In another terminal, start frontend
npm run dev:client
```

2. Open http://localhost:5173 in your browser

3. Log in with your TikTok Shop credentials

4. Configure the bot settings in the dashboard

5. Start the bot and monitor its progress

## Configuration

The bot can be configured through the web dashboard or by editing the config file:

- `minFollowers`: Minimum follower count for creators
- `maxFollowers`: Maximum follower count for creators
- `categories`: Array of creator categories to target
- `invitationLimit`: Maximum number of invitations per session
- `actionDelay`: Delay between actions (ms)
- `maxDailyInvites`: Maximum invitations per day

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Disclaimer

This tool is for production purposes only for Digi4U Repair. Digi4U Repair will use at their own risk and ensure compliance with TikTok's terms of service.
