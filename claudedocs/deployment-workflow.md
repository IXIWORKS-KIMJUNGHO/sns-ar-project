# AR 웹앱 배포 워크플로우

교회 도메인에 AR 페이지를 호스팅하는 전체 프로세스

---

## 🎯 배포 목표

**최종 목표**: `https://교회도메인.com/ar` 또는 `https://ar.교회도메인.com`에서 AR 웹앱 서비스

**요구사항**:
- ✅ HTTPS 필수 (AR Quick Look, Scene Viewer 요구사항)
- ✅ 모바일 최적화
- ✅ 빠른 로딩 속도
- ✅ 안정적인 호스팅

---

## 📋 배포 옵션 비교

### Option 1: Vercel (추천 ⭐️⭐️⭐️⭐️⭐️)

**장점**:
- ✅ 무료 호스팅 (상업용 가능)
- ✅ 자동 HTTPS
- ✅ 글로벌 CDN (빠른 속도)
- ✅ Git 연동 (자동 배포)
- ✅ 커스텀 도메인 무료
- ✅ 설정 초간단 (5분 안에 완료)

**단점**:
- 없음 (이 프로젝트에는 완벽)

**가격**: 무료 (Hobby Plan)

---

### Option 2: Netlify (추천 ⭐️⭐️⭐️⭐️)

**장점**:
- ✅ 무료 호스팅
- ✅ 자동 HTTPS
- ✅ 글로벌 CDN
- ✅ Git 연동
- ✅ 커스텀 도메인

**단점**:
- Vercel보다 약간 느림

**가격**: 무료 (Starter Plan)

---

### Option 3: GitHub Pages (추천 ⭐️⭐️⭐️)

**장점**:
- ✅ 완전 무료
- ✅ GitHub 통합

**단점**:
- ❌ 커스텀 도메인 HTTPS 설정 복잡
- ❌ SPA 라우팅 제한

**가격**: 무료

---

### Option 4: 교회 자체 서버

**장점**:
- ✅ 완전한 통제권

**단점**:
- ❌ HTTPS 인증서 직접 관리
- ❌ 서버 유지보수 필요
- ❌ CDN 없음 (느린 속도)
- ❌ 비용 발생 가능

**가격**: 서버 비용 + 유지보수 비용

---

## 🚀 추천 배포 방법: Vercel

### Step 1: 프로덕션 빌드

```bash
cd /Users/kimjungho/Documents/kimjungho_coding/sns-ar-project/js-ar-poc

# 빌드 실행
npm run build

# dist/ 폴더 생성 확인
ls -la dist/
```

**예상 결과**:
```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── models/
└── qr-codes/
```

---

### Step 2: Vercel 계정 생성 및 프로젝트 설정

#### 2.1 Vercel 가입
1. https://vercel.com 접속
2. "Sign Up" 클릭
3. GitHub 계정으로 가입 (추천)

#### 2.2 새 프로젝트 생성

**방법 A: GitHub 연동 (추천)**
```bash
# 1. GitHub에 레포지토리 생성
gh repo create onnuri-ar --public

# 2. 코드 푸시
git add .
git commit -m "Initial commit: AR web app"
git push origin main

# 3. Vercel에서 Import
# - Vercel 대시보드 → "Add New" → "Project"
# - GitHub 레포지토리 선택
# - "Import" 클릭
```

**방법 B: Vercel CLI (빠른 테스트)**
```bash
# Vercel CLI 설치
npm install -g vercel

# 로그인
vercel login

# 배포
cd js-ar-poc
vercel

# 프로덕션 배포
vercel --prod
```

---

### Step 3: Vercel 프로젝트 설정

**Build & Development Settings**:
```
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

**Environment Variables** (필요시):
```
# 현재 프로젝트는 환경 변수 불필요
# 추후 API 키 등이 필요하면 여기 추가
```

---

### Step 4: 커스텀 도메인 연결

#### 4.1 Vercel 대시보드에서 도메인 추가

1. Vercel 프로젝트 → "Settings" → "Domains"
2. "Add" 클릭
3. 도메인 입력 예시:
   - `ar.onnurichurch.com` (서브도메인 권장)
   - 또는 `www.onnurichurch.com/ar` (경로 방식)

#### 4.2 DNS 설정

**교회 도메인 관리자에게 요청할 내용**:

**Option A: 서브도메인 (ar.교회도메인.com)**
```
Type: CNAME
Name: ar
Value: cname.vercel-dns.com
```

**Option B: Apex 도메인 (교회도메인.com)**
```
Type: A
Name: @
Value: 76.76.21.21
```

**예시 (가비아 기준)**:
```
호스트: ar
타입: CNAME
값: cname.vercel-dns.com
TTL: 3600
```

#### 4.3 SSL 인증서 (자동)

Vercel이 자동으로 Let's Encrypt SSL 인증서 발급
- 발급 시간: 1-5분
- 자동 갱신

---

### Step 5: 배포 확인 및 테스트

```bash
# 배포된 URL 접속 (Vercel이 제공)
https://onnuri-ar.vercel.app

# 또는 커스텀 도메인
https://ar.onnurichurch.com
```

**테스트 체크리스트**:
- [ ] HTTPS 작동 확인
- [ ] 모바일 iOS Safari에서 QR 스캔
- [ ] 모바일 Android Chrome에서 QR 스캔
- [ ] AR Quick Look 실행 (iOS)
- [ ] Scene Viewer 실행 (Android)
- [ ] 3개 QR 코드 모두 테스트
- [ ] 각 모델이 올바르게 로드되는지 확인

---

## 🔧 고급 설정 (선택 사항)

### 성능 최적화

**vite.config.js 수정**:
```javascript
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'model-viewer': ['@google/model-viewer']
        }
      }
    },
    // 파일 압축
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true // 프로덕션에서 console.log 제거
      }
    }
  }
});
```

### 캐싱 설정

**vercel.json 생성**:
```json
{
  "headers": [
    {
      "source": "/assets/models/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/qr-codes/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=86400"
        }
      ]
    }
  ]
}
```

---

## 📊 배포 후 모니터링

### Vercel Analytics (무료)

1. Vercel 대시보드 → "Analytics"
2. 자동으로 수집되는 데이터:
   - 페이지 뷰
   - 고유 방문자
   - 로딩 속도
   - 디바이스 종류
   - 지역별 접속

### Google Analytics (선택 사항)

**index.html에 추가**:
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

---

## 🔄 업데이트 워크플로우

### GitHub 연동 시 (추천)

```bash
# 1. 코드 수정
# 2. 커밋
git add .
git commit -m "Update: 모델 변경"

# 3. 푸시 (자동 배포)
git push origin main

# Vercel이 자동으로 빌드 및 배포 (1-2분 소요)
```

### Vercel CLI 사용 시

```bash
# 로컬에서 테스트
npm run dev

# 코드 수정 후 배포
vercel --prod
```

---

## 🐛 문제 해결

### 1. 빌드 실패

**증상**: Vercel 빌드 실패
**해결**:
```bash
# 로컬에서 빌드 테스트
npm run build

# 에러 확인 및 수정
# package.json 의존성 확인
```

### 2. 3D 모델 로딩 실패

**증상**: AR 모델이 로드되지 않음
**해결**:
- 모델 파일 경로 확인: `/assets/models/church-model-01.glb`
- CORS 설정 확인 (Vercel은 자동 처리)

### 3. HTTPS 인증서 문제

**증상**: "Not Secure" 경고
**해결**:
- Vercel 대시보드 → Domains → SSL 상태 확인
- DNS 전파 대기 (최대 48시간)

### 4. QR 스캔 후 다른 사이트로 이동

**증상**: QR 스캔 시 원치 않는 URL로 이동
**해결**:
- QR 코드 내용 확인 (1, 2, 3만 있어야 함)
- 새 QR 코드 생성

---

## 📝 배포 체크리스트

### 배포 전
- [ ] 로컬 테스트 완료 (`npm run dev`)
- [ ] 프로덕션 빌드 성공 (`npm run build`)
- [ ] 3D 모델 파일 모두 존재 확인
- [ ] QR 코드 3개 준비
- [ ] Git 커밋 완료

### 배포 중
- [ ] Vercel 계정 생성
- [ ] GitHub 레포지토리 연동
- [ ] Vercel 프로젝트 설정
- [ ] 빌드 설정 확인
- [ ] 자동 배포 성공

### 배포 후
- [ ] 배포된 URL 접속 테스트
- [ ] HTTPS 작동 확인
- [ ] 모바일 iOS 테스트
- [ ] 모바일 Android 테스트
- [ ] QR 코드 3개 모두 테스트
- [ ] 커스텀 도메인 연결 (선택)
- [ ] DNS 설정 (선택)
- [ ] SSL 인증서 발급 확인 (선택)

---

## 🎉 최종 결과

**배포 완료 시**:
```
✅ URL: https://ar.onnurichurch.com
✅ HTTPS: 자동 적용
✅ 글로벌 CDN: 빠른 속도
✅ 자동 배포: Git push 시 자동 업데이트
✅ 모니터링: Vercel Analytics
```

**사용자 경험**:
1. 교회 웹사이트에서 "AR 체험" 링크 클릭 또는 QR 스캔
2. `https://ar.onnurichurch.com` 접속
3. 카메라 권한 승인
4. QR 코드 스캔
5. 3D 모델 AR로 체험
6. 공유 및 SNS 업로드

---

## 💡 추가 개선 아이디어

### 1. 소셜 미디어 최적화

**Open Graph 태그 추가** (index.html):
```html
<meta property="og:title" content="온누리 교회 40주년 AR 체험">
<meta property="og:description" content="AR로 온누리 교회를 체험해보세요">
<meta property="og:image" content="https://ar.onnurichurch.com/og-image.jpg">
<meta property="og:url" content="https://ar.onnurichurch.com">
```

### 2. PWA (Progressive Web App)

**manifest.json 생성**:
```json
{
  "name": "온누리 교회 AR",
  "short_name": "온누리 AR",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#667eea",
  "theme_color": "#667eea",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ]
}
```

### 3. 사용자 분석

- 어떤 모델이 가장 많이 스캔되는지
- 평균 체험 시간
- 디바이스 분포 (iOS vs Android)
- 지역별 접속 통계

---

## 📞 지원

**Vercel 공식 문서**: https://vercel.com/docs
**Vite 공식 문서**: https://vitejs.dev/guide/
**model-viewer 문서**: https://modelviewer.dev/

**문제 발생 시**:
1. Vercel 대시보드 → "Deployments" → 로그 확인
2. 브라우저 개발자 도구 → Console 확인
3. 이 문서의 "문제 해결" 섹션 참고
