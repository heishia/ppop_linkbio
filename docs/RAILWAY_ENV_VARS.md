# Railway 프로덕션 환경변수 설정 가이드

이 문서는 Railway에 배포된 백엔드 서비스에 필요한 프로덕션 환경변수 목록을 제공합니다.

## Railway 환경변수 설정 방법

1. Railway 대시보드 접속
2. 프로젝트 선택 → 서비스 선택
3. **Variables** 탭 클릭
4. **New Variable** 버튼으로 환경변수 추가
5. 각 환경변수 입력 후 **Add** 클릭

---

## 필수 환경변수 (Required)

### App Configuration
```env
APP_ENV=prod
APP_NAME=PPOPLINK
APP_PORT=8000
```

### Database (Supabase)
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-anon-key
SUPABASE_SERVICE_KEY=your-supabase-service-role-key
```

### PPOP Auth (SSO)
```env
PPOP_AUTH_API_URL=https://auth-api.yourdomain.com
PPOP_AUTH_CLIENT_URL=https://auth.yourdomain.com
PPOP_AUTH_CLIENT_ID=your-client-id
PPOP_AUTH_CLIENT_SECRET=your-client-secret
PPOP_AUTH_REDIRECT_URI=https://ppop.link/auth/callback
PPOP_AUTH_JWKS_URI=https://auth-api.yourdomain.com/.well-known/jwks.json
```

### Server Configuration
```env
DEBUG=false
API_PREFIX=/api
CORS_ORIGINS=https://ppop.link,https://ppoplink.site,https://www.ppop.link
```

---

## 선택적 환경변수 (Optional)

### Storage (Supabase Storage)
```env
STORAGE_BUCKET_PROFILES=profiles
STORAGE_BUCKET_BACKGROUNDS=backgrounds
MAX_FILE_SIZE_MB=5
```

### Plan Limits
```env
FREE_MAX_LINKS=6
FREE_MAX_SOCIAL_LINKS=5
```

### Logging
```env
LOG_LEVEL=INFO
```

### Sentry (Error Tracking)
```env
SENTRY_DSN=your-sentry-dsn
SENTRY_ENVIRONMENT=production
```

---

## 전체 환경변수 예시

Railway Variables 탭에 다음을 모두 추가하세요:

```env
# App Configuration
APP_ENV=prod
APP_NAME=PPOPLINK
APP_PORT=8000

# Database (Supabase)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-anon-key
SUPABASE_SERVICE_KEY=your-supabase-service-role-key

# PPOP Auth (SSO)
PPOP_AUTH_API_URL=https://auth-api.yourdomain.com
PPOP_AUTH_CLIENT_URL=https://auth.yourdomain.com
PPOP_AUTH_CLIENT_ID=your-client-id
PPOP_AUTH_CLIENT_SECRET=your-client-secret
PPOP_AUTH_REDIRECT_URI=https://ppop.link/auth/callback
PPOP_AUTH_JWKS_URI=https://auth-api.yourdomain.com/.well-known/jwks.json

# Server Configuration
DEBUG=false
API_PREFIX=/api
CORS_ORIGINS=https://ppop.link,https://ppoplink.site,https://www.ppop.link

# Storage (Supabase Storage)
STORAGE_BUCKET_PROFILES=profiles
STORAGE_BUCKET_BACKGROUNDS=backgrounds
MAX_FILE_SIZE_MB=5

# Plan Limits
FREE_MAX_LINKS=6
FREE_MAX_SOCIAL_LINKS=5

# Logging
LOG_LEVEL=INFO

# Sentry (Optional)
SENTRY_DSN=your-sentry-dsn
SENTRY_ENVIRONMENT=production
```

---

## 중요 사항

### CORS_ORIGINS 설정
- 쉼표로 구분된 도메인 목록
- 프로토콜 포함 (http:// 또는 https://)
- 공백 없이 입력
- 예: `https://ppop.link,https://ppoplink.site`

### 보안
- **절대** 코드에 실제 값을 커밋하지 마세요
- Railway 환경변수만 사용하세요
- 민감한 정보는 Railway Secrets로 관리하세요

### 환경변수 확인
배포 후 다음 명령어로 환경변수가 제대로 설정되었는지 확인할 수 있습니다:

```bash
# Railway CLI 사용
railway variables

# 또는 Railway 대시보드에서 확인
```

---

## 문제 해결

### CORS 에러가 발생하는 경우
1. `CORS_ORIGINS` 환경변수 확인
2. 프론트엔드 도메인이 포함되어 있는지 확인
3. 프로토콜(http/https)이 올바른지 확인
4. 쉼표 구분이 올바른지 확인
5. Railway 서비스 재시작

### 환경변수가 적용되지 않는 경우
1. Railway 서비스 재배포
2. 환경변수 이름이 정확한지 확인 (대소문자 구분)
3. Railway 로그에서 환경변수 로드 확인

---

## 참고 자료

- [Railway 환경변수 문서](https://docs.railway.app/develop/variables)
- [프로젝트 배포 가이드](./DEPLOYMENT.md)
- [PPOP Auth 설정 가이드](./PPOP_AUTH_SETUP.md)

