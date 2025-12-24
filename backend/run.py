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
    try:
        print(f"Starting backend server on port {settings.APP_PORT}...")
        print(f"DEBUG mode: {settings.DEBUG}")
        print(f"API prefix: {settings.API_PREFIX}")
        print(f"Access API docs at: http://localhost:{settings.APP_PORT}{settings.API_PREFIX}/docs")
        print("-" * 60)
        
        # Test if we can import the app before starting
        try:
            from backend.main import app
            print("[OK] Backend app imported successfully")
        except Exception as e:
            print(f"[ERROR] Failed to import backend app: {e}")
            import traceback
            traceback.print_exc()
            return
        
        uvicorn.run(
            "backend.main:app",
            host="0.0.0.0",
            port=settings.APP_PORT,
            reload=settings.DEBUG,
            log_level="info" if settings.DEBUG else "warning"
        )
    except Exception as e:
        print(f"[ERROR] Failed to start backend server: {e}")
        import traceback
        traceback.print_exc()
        raise


if __name__ == "__main__":
    run_server()

