@echo off
echo Starting TikTok Affiliator Development Environment...

REM Load environment variables
set PORT=5000
set NODE_ENV=development
set TIKTOK_EMAIL=demo@example.com
set TIKTOK_PASSWORD=demopassword

REM Start backend server in a new window
start cmd /k "npx tsx server/index.ts"

REM Wait a moment for backend to initialize
timeout /t 5

REM Start frontend server in a new window
start cmd /k "cd client && npm run dev"

echo Development servers started:
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo Press any key to close this window...
pause >nul
