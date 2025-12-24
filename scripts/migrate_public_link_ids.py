"""
기존 사용자들의 public_link_id를 생성하는 마이그레이션 스크립트

이 스크립트는 user_seq 값이 있지만 public_link_id가 없는 사용자들에게
암호화된 공개 링크 ID를 생성합니다.

사용법:
    python scripts/migrate_public_link_ids.py

환경변수:
    SUPABASE_URL: Supabase 프로젝트 URL
    SUPABASE_SERVICE_KEY: Supabase 서비스 롤 키 (service_role key)
"""

import os
import sys

# 프로젝트 루트를 path에 추가
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
from supabase import create_client, Client

# backend 유틸리티 import
from backend.utils.linkid_utils import encode_user_seq

# 환경변수 로드 (.env.dev 파일 우선)
load_dotenv(".env.dev")
load_dotenv()  # .env 파일도 fallback으로 로드


def get_supabase_client() -> Client:
    """Supabase 클라이언트 생성"""
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_KEY") or os.getenv("SUPABASE_KEY")
    
    if not url or not key:
        raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_KEY must be set")
    
    return create_client(url, key)


def migrate_public_link_ids():
    """
    public_link_id가 없는 모든 사용자에게 public_link_id 생성
    """
    print("Starting migration of public_link_ids...")
    
    db = get_supabase_client()
    
    # public_link_id가 없는 사용자들 조회
    result = db.table("users").select("id, user_seq, username").is_("public_link_id", "null").execute()
    
    if not result.data:
        print("No users need migration.")
        return
    
    print(f"Found {len(result.data)} users to migrate.")
    
    success_count = 0
    error_count = 0
    
    for user in result.data:
        user_id = user["id"]
        user_seq = user.get("user_seq")
        username = user.get("username", "unknown")
        
        if not user_seq:
            print(f"  [SKIP] User {username} (id={user_id}) has no user_seq")
            continue
        
        try:
            # public_link_id 생성
            public_link_id = encode_user_seq(user_seq)
            
            # 업데이트
            db.table("users").update({
                "public_link_id": public_link_id
            }).eq("id", user_id).execute()
            
            print(f"  [OK] User {username}: user_seq={user_seq} -> public_link_id={public_link_id}")
            success_count += 1
            
        except Exception as e:
            print(f"  [ERROR] User {username} (id={user_id}): {e}")
            error_count += 1
    
    print(f"\nMigration complete!")
    print(f"  Success: {success_count}")
    print(f"  Errors: {error_count}")
    print(f"  Skipped: {len(result.data) - success_count - error_count}")


def verify_migration():
    """
    마이그레이션 결과 확인
    """
    print("\nVerifying migration...")
    
    db = get_supabase_client()
    
    # 전체 사용자 수
    total_result = db.table("users").select("id", count="exact").execute()
    total_count = total_result.count if total_result.count else len(total_result.data)
    
    # public_link_id가 있는 사용자 수
    with_link_id = db.table("users").select("id", count="exact").not_.is_("public_link_id", "null").execute()
    with_link_id_count = with_link_id.count if with_link_id.count else len(with_link_id.data)
    
    # public_link_id가 없는 사용자 수
    without_link_id = db.table("users").select("id", count="exact").is_("public_link_id", "null").execute()
    without_link_id_count = without_link_id.count if without_link_id.count else len(without_link_id.data)
    
    print(f"  Total users: {total_count}")
    print(f"  With public_link_id: {with_link_id_count}")
    print(f"  Without public_link_id: {without_link_id_count}")


if __name__ == "__main__":
    try:
        migrate_public_link_ids()
        verify_migration()
    except Exception as e:
        print(f"Migration failed: {e}")
        sys.exit(1)

