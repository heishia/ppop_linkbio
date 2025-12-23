# 컬렉션/데이터 구조 유틸리티

from typing import List, Dict, Any, Optional, Callable, TypeVar, Iterable

T = TypeVar("T")


def remove_duplicates(items: List[T], key: Optional[Callable[[T], Any]] = None) -> List[T]:
    """리스트 중복 제거"""
    if not items:
        return []
    
    if key is None:
        seen = set()
        result = []
        for item in items:
            if item not in seen:
                seen.add(item)
                result.append(item)
        return result
    else:
        seen = set()
        result = []
        for item in items:
            key_value = key(item)
            if key_value not in seen:
                seen.add(key_value)
                result.append(item)
        return result


def flatten(nested_list: List[List[T]]) -> List[T]:
    """리스트 평탄화(flatten)"""
    result = []
    for sublist in nested_list:
        result.extend(sublist)
    return result


def safe_get(dictionary: Dict[str, Any], key: str, default: Any = None) -> Any:
    """dict key 존재 안전 조회"""
    return dictionary.get(key, default)


def merge_dicts(*dicts: Dict[str, Any], priority: Optional[List[int]] = None) -> Dict[str, Any]:
    """dict 병합 (우선순위 적용)"""
    if not dicts:
        return {}
    
    result = {}
    
    if priority:
        # 우선순위에 따라 병합
        for idx in priority:
            if 0 <= idx < len(dicts):
                result.update(dicts[idx])
        # 나머지도 병합
        for i, d in enumerate(dicts):
            if i not in priority:
                result.update(d)
    else:
        # 순서대로 병합 (나중 것이 우선)
        for d in dicts:
            result.update(d)
    
    return result


def remove_empty_values(data: Dict[str, Any]) -> Dict[str, Any]:
    """빈 값 제거 (None, "", [])"""
    return {k: v for k, v in data.items() if v not in (None, "", [])}


def chunk_list(items: List[T], chunk_size: int) -> List[List[T]]:
    """리스트 chunk 분할"""
    if not items or chunk_size <= 0:
        return []
    
    return [items[i:i + chunk_size] for i in range(0, len(items), chunk_size)]


def safe_sort(items: List[T], key: Optional[Callable[[T], Any]] = None, reverse: bool = False) -> List[T]:
    """정렬 키 안전 적용"""
    if not items:
        return []
    
    try:
        return sorted(items, key=key, reverse=reverse)
    except (TypeError, ValueError):
        # 정렬 실패 시 원본 반환
        return items.copy()

