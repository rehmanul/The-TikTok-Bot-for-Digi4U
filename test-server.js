const { spawn } = require('child_process');

console.log('Starting server test...');

const server = spawn('npx', ['tsx', 'server/index.ts'], {
  cwd: process.cwd(),
  env: { ...process.env, NODE_ENV: 'development' },
  stdio: 'pipe'
});

server.stdout.on('data', (data) => {
  console.log(`Server output: ${data}`);
});

server.stderr.on('data', (data) => {
  console.error(`Server error: ${data}`);
});

server.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
});

// Keep the process alive for a few seconds
setTimeout(() => {
  console.log('Terminating server test...');
  server.kill();
}, 5000);
