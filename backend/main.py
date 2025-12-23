"""
FastAPI application definition
"""
from fastapi import FastAPI

# FastAPI 앱 인스턴스
app = FastAPI(
    title="PPOP LinkBio API",
    description="Link in bio service API",
    version="0.1.0"
)

