# 테스트 가이드

이 문서는 비로그인 생성 및 PPOP Auth 구독 연동 기능의 테스트 방법을 안내합니다.

## 테스트 항목

### 1. 워터마크 제거 로직 테스트

#### 1.1 공개 프로필 페이지 워터마크 테스트

**목적**: PRO 사용자는 워터마크가 숨겨지고, BASIC 사용자는 워터마크가 표시되는지 확인

**테스트 방법**:

1. **로컬 환경 실행**

   ```bash
   # 백엔드 실행
   cd backend
   python -m uvicorn backend.main:app --reload --port 8000

   # 프론트엔드 실행
   cd web
   npm run dev
   ```

2. **BASIC 사용자 프로필 확인**

   - 공개 프로필 페이지 접속: `http://localhost:3000/{public_link_id}`
   - 하단에 "PPOPLINK" 워터마크가 표시되는지 확인
   - 워터마크가 보이면 ✅ 성공

3. **PRO 사용자 프로필 확인**

   - PPOP Auth에서 PRO 플랜 활성화된 사용자로 로그인
   - 공개 프로필 페이지 접속: `http://localhost:3000/{public_link_id}`
   - 하단에 워터마크가 없는지 확인
   - 워터마크가 없으면 ✅ 성공

4. **API 응답 확인**

   ```bash
   # 공개 프로필 API 호출
   curl http://localhost:8000/api/public/{public_link_id}

   # 응답에서 is_pro_user 필드 확인
   # BASIC 사용자: "is_pro_user": false
   # PRO 사용자: "is_pro_user": true
   ```

#### 1.2 대시보드 미리보기 워터마크 테스트

**목적**: 대시보드의 링크 미리보기에서도 PRO 사용자는 워터마크가 숨겨지는지 확인

**테스트 방법**:

1. **BASIC 사용자로 로그인**

   - 대시보드 접속: `http://localhost:3000/dashboard/links`
   - 미리보기 영역에서 하단에 "PPOPLINK" 워터마크와 X 버튼이 표시되는지 확인
   - X 버튼 클릭 시 결제 페이지로 이동하는지 확인

2. **PRO 사용자로 로그인**
   - PRO 플랜 활성화된 사용자로 로그인
   - 대시보드 접속: `http://localhost:3000/dashboard/links`
   - 미리보기 영역에서 워터마크가 없는지 확인

### 2. 통계 기능 권한 체크 테스트

#### 2.1 BASIC 사용자 접근 차단 테스트

**목적**: BASIC 사용자는 통계 페이지에 접근할 수 없어야 함

**테스트 방법**:

1. **BASIC 사용자로 로그인**

   ```bash
   # BASIC 플랜 사용자로 로그인
   ```

2. **통계 페이지 접근 시도**

   - 브라우저에서 `http://localhost:3000/dashboard/analytics` 접속
   - 에러 메시지와 "Upgrade to PRO" 버튼이 표시되는지 확인
   - 버튼 클릭 시 결제 페이지로 이동하는지 확인

3. **API 직접 호출 테스트**

   ```bash
   # BASIC 사용자 토큰으로 API 호출
   curl -H "Authorization: Bearer {basic_user_token}" \
        http://localhost:8000/api/analytics

   # 응답: 403 Forbidden
   # {
   #   "detail": "Analytics feature is available for PRO plan only"
   # }
   ```

#### 2.2 PRO 사용자 접근 허용 테스트

**목적**: PRO 사용자는 통계 페이지에 접근할 수 있어야 함

**테스트 방법**:

1. **PRO 사용자로 로그인**

   ```bash
   # PRO 플랜 활성화된 사용자로 로그인
   ```

2. **통계 페이지 접근**

   - 브라우저에서 `http://localhost:3000/dashboard/analytics` 접속
   - 통계 데이터가 정상적으로 표시되는지 확인
   - 링크별 클릭 통계, 일별 클릭 추이 등이 보이는지 확인

3. **API 직접 호출 테스트**

   ```bash
   # PRO 사용자 토큰으로 API 호출
   curl -H "Authorization: Bearer {pro_user_token}" \
        http://localhost:8000/api/analytics

   # 응답: 200 OK
   # {
   #   "success": true,
   #   "data": {
   #     "overview": {...},
   #     "link_stats": [...],
   #     "daily_clicks": [...]
   #   }
   # }
   ```

### 3. 백엔드 API 테스트

#### 3.1 공개 프로필 API 테스트

```bash
# 공개 프로필 조회
curl http://localhost:8000/api/public/{public_link_id}

# 응답 예시
{
  "success": true,
  "data": {
    "public_link_id": "abc123",
    "username": "testuser",
    "display_name": "Test User",
    "is_pro_user": false,  # 또는 true
    ...
  }
}
```

#### 3.2 구독 상태 확인 API 테스트

```bash
# 구독 상태 조회
curl -H "Authorization: Bearer {access_token}" \
     http://localhost:8000/api/auth/subscription/ppop-link

# 응답 예시
{
  "success": true,
  "data": {
    "hasAccess": true,
    "plan": "PRO",  # 또는 "BASIC"
    "status": "ACTIVE",
    "expiresAt": "2024-12-31T23:59:59Z"
  }
}
```

## 자동화 테스트

### 백엔드 테스트 실행

```bash
cd backend

# 모든 테스트 실행
pytest

# 특정 테스트 파일 실행
pytest backend/tests/integration/test_public_api.py

# 커버리지 포함 실행
pytest --cov=backend --cov-report=html
```

### 프론트엔드 테스트 실행

```bash
cd web

# 단위 테스트 실행
npm test

# E2E 테스트 실행
npm run test:e2e

# 커버리지 포함 실행
npm run test:coverage
```

## 테스트 체크리스트

### 워터마크 제거 로직

- [ ] BASIC 사용자 공개 프로필에 워터마크 표시
- [ ] PRO 사용자 공개 프로필에 워터마크 숨김
- [ ] BASIC 사용자 대시보드 미리보기에 워터마크 표시
- [ ] PRO 사용자 대시보드 미리보기에 워터마크 숨김
- [ ] 공개 프로필 API 응답에 `is_pro_user` 필드 포함
- [ ] `is_pro_user` 값이 올바르게 설정됨 (BASIC: false, PRO: true)

### 통계 기능 권한 체크

- [ ] BASIC 사용자 통계 페이지 접근 차단
- [ ] BASIC 사용자 통계 API 호출 시 403 에러
- [ ] PRO 사용자 통계 페이지 접근 허용
- [ ] PRO 사용자 통계 API 호출 시 200 응답
- [ ] 에러 메시지 및 업그레이드 버튼 표시
- [ ] 업그레이드 버튼 클릭 시 결제 페이지 이동

## 문제 해결

### 워터마크가 표시되지 않는 경우

1. **브라우저 개발자 도구 확인**

   - Network 탭에서 API 응답 확인
   - `is_pro_user` 값 확인

2. **백엔드 로그 확인**

   ```bash
   # 백엔드 로그에서 구독 상태 확인 로그 확인
   # "Subscription check for {user_id}: plan=..." 메시지 확인
   ```

3. **PPOP Auth 관리자 API 확인**
   - 관리자 API 엔드포인트가 올바른지 확인
   - API 키가 올바르게 설정되었는지 확인

### 통계 페이지 접근 오류

1. **인증 상태 확인**

   - 로그인 상태 확인
   - 토큰 유효성 확인

2. **구독 상태 확인**

   - 구독 상태 API 호출하여 확인
   - PRO 플랜 활성화 여부 확인

3. **백엔드 로그 확인**
   - 권한 체크 로직 실행 여부 확인
   - 에러 메시지 확인

## 참고사항

- PPOP Auth 관리자 API의 정확한 엔드포인트 구조에 따라 `check_user_subscription_by_user_id` 메서드를 수정해야 할 수 있습니다.
- 실제 프로덕션 환경에서는 PPOP Auth 관리자 API 키가 올바르게 설정되어 있어야 합니다.
- 테스트 시 실제 PPOP Auth 서버와 연동되어 있어야 구독 상태를 정확히 확인할 수 있습니다.
