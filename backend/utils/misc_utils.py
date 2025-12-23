# 기타 실무 자주 쓰는 유틸리티

import time
import functools
from typing import Callable, Any, Optional, TypeVar, Union
import logging

T = TypeVar("T")

logger = logging.getLogger(__name__)


def measure_time(func: Callable[..., T]) -> Callable[..., T]:
    """실행 시간 측정 데코레이터"""
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start_time = time.time()
        try:
            result = func(*args, **kwargs)
            return result
        finally:
            elapsed_time = time.time() - start_time
            logger.info(f"{func.__name__} executed in {elapsed_time:.4f} seconds")
    
    return wrapper


def retry(
    max_attempts: int = 3,
    delay: float = 1.0,
    backoff: float = 2.0,
    exceptions: tuple = (Exception,),
    on_retry: Optional[Callable[[Exception, int], None]] = None
) -> Callable[[Callable[..., T]], Callable[..., T]]:
    """재시도(retry) 데코레이터"""
    def decorator(func: Callable[..., T]) -> Callable[..., T]:
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            current_delay = delay
            last_exception = None
            
            for attempt in range(1, max_attempts + 1):
                try:
                    return func(*args, **kwargs)
                except exceptions as e:
                    last_exception = e
                    
                    if attempt < max_attempts:
                        if on_retry:
                            on_retry(e, attempt)
                        
                        logger.warning(
                            f"{func.__name__} failed (attempt {attempt}/{max_attempts}): {str(e)}. "
                            f"Retrying in {current_delay} seconds..."
                        )
                        time.sleep(current_delay)
                        current_delay *= backoff
                    else:
                        logger.error(f"{func.__name__} failed after {max_attempts} attempts")
            
            raise last_exception
        
        return wrapper
    return decorator


def safe_execute(
    func: Callable[..., T],
    default: Optional[T] = None,
    on_error: Optional[Callable[[Exception], None]] = None,
    *args,
    **kwargs
) -> Optional[T]:
    """안전한 함수 실행(wrapper)"""
    try:
        return func(*args, **kwargs)
    except Exception as e:
        if on_error:
            on_error(e)
        else:
            logger.error(f"Error executing {func.__name__}: {str(e)}")
        return default

