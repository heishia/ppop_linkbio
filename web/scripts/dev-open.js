const { spawn } = require('child_process');
const { exec } = require('child_process');

// 브라우저 열기 (Windows)
const platform = process.platform;
let browserCommand;

if (platform === 'win32') {
  browserCommand = 'start http://localhost:3000';
} else if (platform === 'darwin') {
  browserCommand = 'open http://localhost:3000';
} else {
  browserCommand = 'xdg-open http://localhost:3000';
}

// 브라우저 열기
exec(browserCommand, (error) => {
  if (error) {
    console.log('브라우저를 자동으로 열 수 없습니다. 수동으로 http://localhost:3000 을 열어주세요.');
  }
});

// Next.js 서버 시작
const nextDev = spawn('npx', ['next', 'dev'], {
  stdio: 'inherit',
  shell: true
});

nextDev.on('error', (error) => {
  console.error('서버 시작 실패:', error);
  process.exit(1);
});

nextDev.on('exit', (code) => {
  process.exit(code || 0);
});

// Ctrl+C 처리
process.on('SIGINT', () => {
  nextDev.kill('SIGINT');
  process.exit(0);
});

