# 파일 처리 유틸리티

import os
import re
import mimetypes
import tempfile
from pathlib import Path
from typing import Optional


def sanitize_filename(filename: str, max_length: int = 255) -> str:
    """업로드 파일명 안전화"""
    if not filename:
        return "file"
    
    # 확장자 분리
    name, ext = os.path.splitext(filename)
    
    # 특수문자 제거 및 공백을 언더스코어로
    name = re.sub(r"[^\w\s-]", "", name)
    name = re.sub(r"[-\s]+", "_", name)
    
    # 길이 제한
    if len(name) > max_length - len(ext):
        name = name[:max_length - len(ext)]
    
    return name + ext


def get_extension(filename: str) -> str:
    """확장자 추출"""
    if not filename:
        return ""
    
    ext = os.path.splitext(filename)[1]
    return ext.lstrip(".").lower()


def get_file_size(file_path: str) -> int:
    """파일 크기 계산 (bytes)"""
    try:
        return os.path.getsize(file_path)
    except OSError:
        return 0


def format_file_size(size_bytes: int) -> str:
    """파일 크기를 읽기 쉬운 형식으로 변환"""
    for unit in ["B", "KB", "MB", "GB", "TB"]:
        if size_bytes < 1024.0:
            return f"{size_bytes:.2f} {unit}"
        size_bytes /= 1024.0
    return f"{size_bytes:.2f} PB"


def check_mime_type(filename: str, allowed_types: Optional[list] = None) -> bool:
    """MIME 타입 체크"""
    if not filename:
        return False
    
    mime_type, _ = mimetypes.guess_type(filename)
    
    if allowed_types is None:
        return mime_type is not None
    
    return mime_type in allowed_types


def get_temp_file_path(prefix: str = "tmp", suffix: str = "", directory: Optional[str] = None) -> str:
    """임시 파일 경로 생성"""
    if directory:
        os.makedirs(directory, exist_ok=True)
    
    fd, path = tempfile.mkstemp(prefix=prefix, suffix=suffix, dir=directory)
    os.close(fd)  # 파일 디스크립터 닫기
    
    return path

