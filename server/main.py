"""
FastAPI 앱 진입점
라우터 등록, 예외 핸들러 등록, 미들웨어 설정
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from server.core.config import settings
from server.core.exceptions import BaseAppException
from server.core.logger import logger

# 라우터 import
from server.auth.router import router as auth_router


def create_app() -> FastAPI:
    app = FastAPI(
        title="PPOP LinkBio API",
        description="Link in bio SaaS service API",
        version="0.1.0",
        docs_url=f"{settings.API_PREFIX}/docs" if settings.DEBUG else None,
        redoc_url=f"{settings.API_PREFIX}/redoc" if settings.DEBUG else None,
    )
    
    setup_middlewares(app)
    setup_exception_handlers(app)
    setup_routers(app)
    
    return app


def setup_middlewares(app: FastAPI) -> None:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


def setup_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(BaseAppException)
    async def app_exception_handler(request: Request, exc: BaseAppException):
        logger.warning(f"AppException: {exc.detail} (status={exc.status_code})")
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "success": False,
                "error": {
                    "message": exc.detail,
                    "data": exc.data
                }
            }
        )
    
    @app.exception_handler(Exception)
    async def general_exception_handler(request: Request, exc: Exception):
        logger.error(f"Unhandled exception: {exc}", exc_info=True)
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": {
                    "message": "Internal server error"
                }
            }
        )


def setup_routers(app: FastAPI) -> None:
    app.include_router(auth_router, prefix=f"{settings.API_PREFIX}/auth", tags=["Auth"])
    
    @app.get("/health")
    async def health_check():
        return {"status": "ok"}


app = create_app()

