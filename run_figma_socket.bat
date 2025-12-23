@echo off
REM Figma MCP WebSocket Server Startup Script
REM Port: 3055

cd /d "C:\Users\jinpuruen\git\cursor-talk-to-figma-mcp"
echo Starting Figma WebSocket Server...
bun run socket
pause

