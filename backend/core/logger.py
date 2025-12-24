"""
로깅 설정
"""

import logging
import sys
from typing import Optional


def setup_logger(
    name: str = "ppoplink",
    level: int = logging.INFO,
    log_format: Optional[str] = None
) -> logging.Logger:
    if log_format is None:
        log_format = "%(asctime)s | %(levelname)-8s | %(name)s:%(lineno)d | %(message)s"
    
    logger = logging.getLogger(name)
    
    if logger.handlers:
        return logger
    
    logger.setLevel(level)
    
    handler = logging.StreamHandler(sys.stdout)
    handler.setLevel(level)
    handler.setFormatter(logging.Formatter(log_format))
    
    logger.addHandler(handler)
    logger.propagate = False
    
    return logger


logger = setup_logger()


def get_logger(name: str) -> logging.Logger:
    return logging.getLogger(f"ppoplink.{name}")

