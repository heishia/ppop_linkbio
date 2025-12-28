# 빠른 테스트 가이드

이 문서는 구현한 기능을 빠르게 테스트하는 방법을 안내합니다.

## 빠른 시작

### 1. 환경 설정

```bash
# 백엔드 환경 변수 설정 (.env 파일)
PPOP_AUTH_API_URL=https://your-auth-api.com
PPOP_AUTH_ADMIN_API_KEY=your-admin-api-key
PPOP_AUTH_SERVICE_CODE=ppop-link

# 프론트엔드 환경 변수 설정 (.env.local 파일)
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### 2. 서버 실행

```bash
# 터미널 1: 백엔드 실행
cd backend
python -m uvicorn backend.main:app --reload --port 8000

# 터미널 2: 프론트엔드 실행
cd web
npm run dev
```

## 수동 테스트

### 워터마크 제거 로직 테스트

1. **공개 프로필 페이지 확인**
   ```
   브라우저에서: http://localhost:3000/{public_link_id}
   ```

2. **API 직접 확인**
   ```bash
   curl http://localhost:8000/api/public/{public_link_id} | jq '.data.is_pro_user'
   ```
   - BASIC 사용자: `false` (워터마크 표시)
   - PRO 사용자: `true` (워터마크 숨김)

3. **대시보드 미리보기 확인**
   ```
   브라우저에서: http://localhost:3000/dashboard/links
   ```
   - BASIC 사용자: 하단에 "PPOPLINK" 워터마크와 X 버튼 표시
   - PRO 사용자: 워터마크 없음

### 통계 기능 권한 체크 테스트

1. **BASIC 사용자 테스트**
   ```bash
   # BASIC 사용자 토큰으로 API 호출
   curl -H "Authorization: Bearer {basic_token}" \
        http://localhost:8000/api/analytics
   ```
   - 예상 응답: `403 Forbidden` + "PRO plan only" 메시지

2. **PRO 사용자 테스트**
   ```bash
   # PRO 사용자 토큰으로 API 호출
   curl -H "Authorization: Bearer {pro_token}" \
        http://localhost:8000/api/analytics
   ```
   - 예상 응답: `200 OK` + 통계 데이터

3. **프론트엔드 페이지 테스트**
   ```
   BASIC 사용자: http://localhost:3000/dashboard/analytics
   → 에러 메시지 + "Upgrade to PRO" 버튼 표시
   
   PRO 사용자: http://localhost:3000/dashboard/analytics
   → 통계 데이터 정상 표시
   ```

## 자동화 테스트 실행

### 백엔드 테스트

```bash
cd backend

# 모든 테스트 실행
pytest

# 워터마크 관련 테스트만 실행
pytest backend/tests/integration/test_public_profile_watermark.py -v

# 통계 권한 테스트만 실행
pytest backend/tests/integration/test_analytics_permission.py -v

# 커버리지 포함 실행
pytest --cov=backend --cov-report=term-missing
```

### 프론트엔드 테스트

```bash
cd web

# 단위 테스트 실행
npm test

# 특정 파일 테스트
npm test -- PublicProfileClient.test.tsx
npm test -- analytics/page.test.tsx
```

## 테스트 체크리스트

### 워터마크 제거
- [ ] BASIC 사용자 공개 프로필에 워터마크 표시 확인
- [ ] PRO 사용자 공개 프로필에 워터마크 숨김 확인
- [ ] API 응답에 `is_pro_user` 필드 포함 확인
- [ ] 대시보드 미리보기에서도 동일하게 동작 확인

### 통계 권한 체크
- [ ] BASIC 사용자 통계 페이지 접근 차단 확인
- [ ] BASIC 사용자 통계 API 403 응답 확인
- [ ] PRO 사용자 통계 페이지 정상 접근 확인
- [ ] PRO 사용자 통계 API 200 응답 확인
- [ ] 에러 메시지 및 업그레이드 버튼 표시 확인

## 문제 해결

### 워터마크가 표시되지 않는 경우

1. **브라우저 개발자 도구 확인**
   - Network 탭 → API 응답 확인
   - `is_pro_user` 값 확인

2. **백엔드 로그 확인**
   ```bash
   # 백엔드 콘솔에서 구독 상태 확인 로그 확인
   # "Subscription check for {user_id}..." 메시지 확인
   ```

### 통계 페이지 접근 오류

1. **토큰 확인**
   ```bash
   # 브라우저 개발자 도구 → Application → Local Storage
   # access_token 확인
   ```

2. **구독 상태 확인**
   ```bash
   curl -H "Authorization: Bearer {token}" \
        http://localhost:8000/api/auth/subscription/ppop-link
   ```

## 참고

- 상세한 테스트 가이드는 [docs/TESTING_GUIDE.md](docs/TESTING_GUIDE.md) 참고
- 테스트 코드는 `backend/tests/integration/` 디렉토리에 있습니다

