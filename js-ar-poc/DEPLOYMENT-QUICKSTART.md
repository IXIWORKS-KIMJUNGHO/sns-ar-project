# 🚀 배포 빠른 시작 가이드

교회 AR 페이지를 5분 안에 배포하기

---

## ✅ 현재 상태

- ✅ 프로덕션 빌드 완료 (`dist/` 폴더)
- ✅ 3D 모델 3개 준비완료
- ✅ QR 코드 3개 생성완료
- ✅ iOS/Android 최적화 완료

---

## 🎯 추천 방법: Vercel (무료, 5분 소요)

### Step 1: Vercel CLI 설치 및 로그인

```bash
# Vercel CLI 설치
npm install -g vercel

# 로그인 (브라우저 열림)
vercel login
```

### Step 2: 프로젝트 배포

```bash
# 프로젝트 디렉토리로 이동
cd /Users/kimjungho/Documents/kimjungho_coding/sns-ar-project/js-ar-poc

# 배포 (처음에는 설정 질문에 모두 Enter)
vercel

# 프로덕션 배포
vercel --prod
```

**예상 결과**:
```
✓ Production: https://onnuri-ar.vercel.app [복사된 URL]
```

---

## 🌐 커스텀 도메인 연결 (선택 사항)

### 1. Vercel 대시보드에서 설정

1. https://vercel.com/dashboard 접속
2. 프로젝트 선택
3. Settings → Domains → Add
4. 도메인 입력: `ar.교회도메인.com`

### 2. DNS 설정 (도메인 관리자에게 요청)

**CNAME 레코드 추가**:
```
호스트: ar
타입: CNAME
값: cname.vercel-dns.com
TTL: 3600
```

**10-30분 후 자동으로 HTTPS 적용**

---

## 📱 테스트 체크리스트

배포 후 반드시 확인:

- [ ] URL 접속 (`https://onnuri-ar.vercel.app`)
- [ ] HTTPS 적용 확인 (자물쇠 아이콘)
- [ ] iPhone으로 QR-1 스캔 → "온누리 교회 01" 로드
- [ ] iPhone으로 QR-2 스캔 → "온누리 교회 02" 로드
- [ ] iPhone으로 QR-3 스캔 → "온누리 교회 03" 로드
- [ ] Android로 QR 스캔 테스트
- [ ] AR Quick Look (iOS) 실행 확인
- [ ] Scene Viewer (Android) 실행 확인

---

## 🔄 업데이트 방법

코드 수정 후:

```bash
# 로컬 테스트
npm run dev

# 빌드 확인
npm run build

# 다시 배포
vercel --prod
```

---

## 📊 배포된 파일 크기

```
Total: ~37 MB

- 3D Models: 31.2 MB
  - church-model-01: 11.0 MB (GLB 5.2MB + USDZ 5.8MB)
  - church-model-02: 11.0 MB
  - church-model-03: 11.0 MB

- JavaScript: ~200 KB
  - iOS QR Scanner: 146 KB
  - AR Manager: 20 KB
  - Main App: 38 KB

- QR Codes: 1.4 KB (3개)
```

---

## 🎉 최종 결과

**배포 완료 후 사용자는**:

1. QR 코드 스캔 또는 URL 직접 접속
2. 카메라 권한 승인
3. QR 코드 스캔
4. AR로 3D 모델 체험
5. 사진 촬영 및 공유

---

## 💡 추가 옵션

### GitHub Pages (무료)

```bash
# gh-pages 패키지 설치
npm install --save-dev gh-pages

# package.json에 추가
"homepage": "https://교회계정.github.io/ar",
"scripts": {
  "deploy": "vite build && gh-pages -d dist"
}

# 배포
npm run deploy
```

### Netlify (무료)

```bash
# Netlify CLI 설치
npm install -g netlify-cli

# 배포
netlify deploy --prod --dir=dist
```

---

## 📞 문제 발생 시

1. **빌드 실패**: `npm run build` 로그 확인
2. **AR 작동 안함**: HTTPS 확인 (필수)
3. **모델 로딩 실패**: 브라우저 콘솔 에러 확인
4. **QR 인식 안됨**: QR 크기 키우거나 조명 개선

---

## ✅ 다음 단계

1. ✅ **배포 완료** → URL 확인
2. ✅ **QR 코드 인쇄** → `public/qr-codes/` 폴더
3. ✅ **현장 설치** → 각 위치에 QR 코드 부착
4. ✅ **테스트** → 실제 사용자 테스트
5. ✅ **모니터링** → Vercel Analytics 확인

---

**상세 가이드**: `claudedocs/deployment-workflow.md` 참고
