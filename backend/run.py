"""
Uvicorn 서버 실행
"""

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

