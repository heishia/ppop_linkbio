#!/usr/bin/env node

const { spawn, exec } = require('child_process');
const path = require('path');

console.log('\x1b[32m%s\x1b[0m', 'Starting PPOP LinkBio Development Servers...\n');

let browserOpened = false;

// Start Backend server (Python)
const python = process.platform === 'win32' ? 'python' : 'python3';
const backendProcess = spawn(python, ['run.py'], {
  cwd: path.join(__dirname, '..'),
  shell: true
});

// Python/Uvicorn outputs INFO logs to stderr, so we need to handle both
const formatBackendOutput = (data, isError = false) => {
  const output = data.toString();
  // Don't filter empty lines - show all output
  const lines = output.split('\n');
  
  lines.forEach(line => {
    if (!line.trim() && lines.length > 1) return; // Skip empty lines between real lines
    
    // Check log level
    if (line.includes('ERROR') || line.includes('CRITICAL') || line.includes('Traceback')) {
      process.stderr.write('\x1b[31m[Backend Error]\x1b[0m ' + line + '\n');
    } else if (line.includes('WARNING') || line.includes('WARN')) {
      process.stdout.write('\x1b[33m[Backend Warning]\x1b[0m ' + line + '\n');
    } else if (line.includes('INFO') || line.includes('Started') || line.includes('Uvicorn') || line.includes('Application')) {
      process.stdout.write('\x1b[36m[Backend]\x1b[0m ' + line + '\n');
    } else if (line.includes('DEBUG')) {
      process.stdout.write('\x1b[90m[Backend Debug]\x1b[0m ' + line + '\n');
    } else {
      // Default output - show everything
      const prefix = isError ? '\x1b[31m[Backend]\x1b[0m ' : '\x1b[36m[Backend]\x1b[0m ';
      process.stdout.write(prefix + line + '\n');
    }
  });
};

backendProcess.stdout.on('data', (data) => {
  formatBackendOutput(data, false);
});

backendProcess.stderr.on('data', (data) => {
  formatBackendOutput(data, true);
});

backendProcess.on('error', (error) => {
  console.error('\x1b[31m%s\x1b[0m', `Error starting backend server: ${error.message}`);
  console.error('\x1b[31m%s\x1b[0m', 'Make sure Python is installed and accessible in PATH');
});

backendProcess.on('exit', (code) => {
  if (code !== 0 && code !== null) {
    console.error('\x1b[31m%s\x1b[0m', `Backend server exited with code ${code}`);
  }
});

// Start Next.js dev server
const webDir = path.join(__dirname, '..', 'web');
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';

const devProcess = spawn(npm, ['run', 'dev'], {
  cwd: webDir,
  shell: true
});

// Monitor output to detect the actual port
devProcess.stdout.on('data', (data) => {
  const output = data.toString();
  process.stdout.write('\x1b[33m[Frontend]\x1b[0m ' + output);
  
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
  process.stderr.write('\x1b[31m[Frontend Error]\x1b[0m ' + data.toString());
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
  console.log('\n\x1b[33m%s\x1b[0m', 'Shutting down servers...');
  backendProcess.kill('SIGINT');
  devProcess.kill('SIGINT');
  setTimeout(() => {
    process.exit(0);
  }, 500);
});

process.on('SIGTERM', () => {
  backendProcess.kill('SIGTERM');
  devProcess.kill('SIGTERM');
  process.exit(0);
});
