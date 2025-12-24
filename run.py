"""
PPOPLINK Backend Server Launcher
Run from project root: python run.py
"""

import sys
from pathlib import Path

# Add project root to Python path
project_root = Path(__file__).resolve().parent
if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))

# Import and run the backend server
from backend.run import run_server

if __name__ == "__main__":
    print("=" * 60)
    print("PPOPLINK Backend Server")
    print("=" * 60)
    print()
    run_server()

