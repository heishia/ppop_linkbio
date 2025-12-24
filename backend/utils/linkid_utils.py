"""
공개 링크 ID 인코딩/디코딩 유틸리티
Sqids 라이브러리를 사용하여 순차 번호를 암호화된 링크 ID로 변환
"""

from sqids import Sqids

# Sqids 설정
# - alphabet: 사용할 문자 세트 (혼동하기 쉬운 문자 제외: 0, O, I, l)
# - min_length: 최소 8자 길이로 설정하여 예측 어렵게 함
ALPHABET = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789"
MIN_LENGTH = 8

# Sqids 인스턴스 생성 (싱글톤)
_sqids = Sqids(alphabet=ALPHABET, min_length=MIN_LENGTH)


def encode_user_seq(user_seq: int) -> str:
    """
    유저 순차 번호를 암호화된 링크 ID로 변환
    
    Args:
        user_seq: 유저의 순차 번호 (양의 정수)
    
    Returns:
        8자 이상의 알파벳+숫자 조합 문자열
    
    Example:
        encode_user_seq(1) -> "Ab3x2Kq9"
        encode_user_seq(100) -> "Yz8mNp4R"
    """
    if user_seq < 1:
        raise ValueError("user_seq must be a positive integer")
    
    return _sqids.encode([user_seq])


def decode_link_id(link_id: str) -> int:
    """
    암호화된 링크 ID를 유저 순차 번호로 변환
    
    Args:
        link_id: 암호화된 링크 ID 문자열
    
    Returns:
        유저의 순차 번호
    
    Raises:
        ValueError: 유효하지 않은 링크 ID인 경우
    
    Example:
        decode_link_id("Ab3x2Kq9") -> 1
        decode_link_id("Yz8mNp4R") -> 100
    """
    if not link_id:
        raise ValueError("link_id cannot be empty")
    
    decoded = _sqids.decode(link_id)
    
    if not decoded:
        raise ValueError("Invalid link_id format")
    
    return decoded[0]


def is_valid_link_id(link_id: str) -> bool:
    """
    링크 ID가 유효한 형식인지 확인
    
    Args:
        link_id: 확인할 링크 ID 문자열
    
    Returns:
        유효하면 True, 아니면 False
    """
    if not link_id or len(link_id) < MIN_LENGTH:
        return False
    
    # 모든 문자가 허용된 알파벳에 포함되는지 확인
    if not all(c in ALPHABET for c in link_id):
        return False
    
    try:
        decoded = _sqids.decode(link_id)
        return len(decoded) > 0 and decoded[0] > 0
    except Exception:
        return False

