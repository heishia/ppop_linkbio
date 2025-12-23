#!/usr/bin/env node

const { spawn, exec } = require('child_process');
const path = require('path');

console.log('\x1b[32m%s\x1b[0m', 'Starting PPOP LinkBio Development Server...\n');

let browserOpened = false;

// Start Next.js dev server
const webDir = path.join(__dirname, '..', 'apps', 'web');
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';

const devProcess = spawn(npm, ['run', 'dev'], {
  cwd: webDir,
  shell: true
});

// Monitor output to detect the actual port
devProcess.stdout.on('data', (data) => {
  const output = data.toString();
  process.stdout.write(output);
  
  // Detect the actual port from Next.js output
  const portMatch = output.match(/Local:\s+http:\/\/localhost:(\d+)/);
  
  if (portMatch && !browserOpened) {
    const port = portMatch[1];
    browserOpened = true;
    
    // Wait a bit for server to be fully ready
    setTimeout(() => {
      const url = `http://localhost:${port}`;
      console.log('\x1b[36m%s\x1b[0m', `\nOpening browser: ${url}\n`);
      
      // Cross-platform browser opening
      const platform = process.platform;
      let command;
      
      if (platform === 'win32') {
        command = `start ${url}`;
      } else if (platform === 'darwin') {
        command = `open ${url}`;
      } else {
        command = `xdg-open ${url}`;
      }
      
      exec(command, (error) => {
        if (error) {
          console.error('Could not open browser automatically. Please open manually:', url);
        }
      });
    }, 1000);
  }
});

devProcess.stderr.on('data', (data) => {
  process.stderr.write(data);
});

devProcess.on('error', (error) => {
  console.error('\x1b[31m%s\x1b[0m', `Error starting dev server: ${error.message}`);
  process.exit(1);
});

devProcess.on('exit', (code) => {
  if (code !== 0 && code !== null) {
    console.error('\x1b[31m%s\x1b[0m', `Dev server exited with code ${code}`);
  }
  process.exit(code || 0);
});

// Handle Ctrl+C
process.on('SIGINT', () => {
  console.log('\n\x1b[33m%s\x1b[0m', 'Shutting down dev server...');
  devProcess.kill('SIGINT');
  setTimeout(() => {
    process.exit(0);
  }, 500);
});

process.on('SIGTERM', () => {
  devProcess.kill('SIGTERM');
  process.exit(0);
});
