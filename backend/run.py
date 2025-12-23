"""
Uvicorn 서버 실행
루트 경로나 backend 폴더 어디서든 실행 가능
"""

import sys
from pathlib import Path

# 프로젝트 루트를 Python path에 추가
current_file = Path(__file__).resolve()
backend_dir = current_file.parent
project_root = backend_dir.parent

if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))

import uvicorn
from backend.core.config import settings


def run_server() -> None:
    uvicorn.run(
        "backend.main:app",
        host="0.0.0.0",
        port=settings.APP_PORT,
        reload=settings.DEBUG
    )


if __name__ == "__main__":
    run_server()

