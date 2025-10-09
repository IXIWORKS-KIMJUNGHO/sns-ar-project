# 온누리 교회 40주년 AR 웹앱 🎉

QR 코드를 스캔하여 교회 건물을 AR(증강현실)로 체험하는 프로덕션 레디 웹 애플리케이션

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Built with Vite](https://img.shields.io/badge/Built%20with-Vite-646CFF?logo=vite)](https://vitejs.dev)
[![AR Technology](https://img.shields.io/badge/AR-model--viewer-4285F4)](https://modelviewer.dev)

---

## ✨ 주요 기능

### 🎯 핵심 기능
- **QR 코드 기반 모델 선택**: 3개의 QR 코드로 서로 다른 3D 모델 로드
- **크로스 플랫폼 AR 지원**:
  - iOS: AR Quick Look (네이티브 AR 체험)
  - Android: Scene Viewer (Google AR Core)
- **완전 모바일 최적화**: PWA 지원, 전체 화면 모드
- **지능형 플랫폼 감지**: iOS/Android 자동 감지 및 최적 모드 선택

### 📱 사용자 경험
- **온보딩 시스템**: 처음 사용자를 위한 단계별 가이드 (3단계)
- **카메라 권한 관리**: 우아한 UX의 권한 요청 화면
- **WebView 감지 및 대응**: 카카오톡/인스타그램 등 인앱 브라우저 감지 시 안내
- **AR 조작 가이드**: AR 실행 전 사용 방법 미리 안내
- **반응형 UI**: Liquid Glass 디자인 시스템 적용

---

## 🎯 사용자 플로우

```
웹앱 접속 → 카메라 권한 요청 → 온보딩 화면 (선택적 스킵)
    ↓
QR 코드 스캔 → 체크마크 애니메이션 → 3D 모델 뷰어 표시
    ↓
모델 회전/확대 확인 → AR 조작 가이드 → "AR로 보기" 클릭
    ↓
AR 세션 시작 → 실제 공간에 모델 배치 → 사진 촬영
```

---

## 🏗️ 기술 스택

### 프론트엔드
- **Vite 7.x** - 초고속 개발 서버 및 프로덕션 빌드
- **Vanilla JavaScript (ES6+)** - 프레임워크 없는 순수 JS (경량화)
- **@google/model-viewer 4.x** - Google의 WebXR 기반 3D 뷰어
- **jsQR 1.4** - 클라이언트 사이드 QR 코드 스캐너

### AR 기술
- **iOS**: AR Quick Look (`.usdz` 포맷)
- **Android**: Scene Viewer (`.glb` 포맷)
- **WebXR API**: 브라우저 네이티브 AR 지원
- **model-viewer**: AR 세션 통합 관리

### UI/UX
- **Pretendard** - 한글 웹폰트
- **Phosphor Icons** - 모던 아이콘 시스템

---

## 📂 프로젝트 구조

```
sns-ar-project/
├── js-ar-poc/                      # 메인 애플리케이션
│   ├── index.html                  # 메인 HTML (인라인 CSS 포함)
│   ├── vite.config.js              # Vite 설정 (HTTPS, CORS)
│   ├── package.json                # 의존성 관리
│   │
│   ├── src/                        # 모듈화된 소스 코드
│   │   ├── model-config.js         # QR → 3D 모델 매핑 설정
│   │   ├── model-viewer-ar-manager.js  # model-viewer AR 통합 관리자
│   │   ├── ios-qr-scanner.js       # QR 스캐너 (jsQR 기반)
│   │   ├── platform-detector.js    # iOS/Android/WebView 감지
│   │   ├── ar-guide-screen.js      # AR 조작 가이드 화면
│   │   ├── camera-permission-screen.js # 카메라 권한 UI
│   │   └── onboarding-screen.js    # 온보딩 시스템
│   │
│   └── public/                     # 정적 파일 (번들링 제외)
│       ├── assets/models/          # 3D 모델 파일
│       │   ├── church-model-01.glb (5.5MB)
│       │   ├── church-model-01.usdz (6MB)
│       │   ├── church-model-02.glb
│       │   ├── church-model-02.usdz
│       │   ├── church-model-03.glb
│       │   └── church-model-03.usdz
│       │
│       └── qr-codes/               # QR 코드 이미지
│           ├── qr-1.png (숫자 "1")
│           ├── qr-2.png (숫자 "2")
│           ├── qr-3.png (숫자 "3")
│           └── README.md
│
└── README.md                       # 이 문서
```

---

## 🚀 시작하기

### 요구사항

- **Node.js** 18+ (LTS 권장)
- **npm** 또는 **yarn**
- **HTTPS 환경** (배포 시 필수)

### 설치

```bash
# 레포지토리 클론
git clone <repository-url>
cd sns-ar-project/js-ar-poc

# 의존성 설치
npm install
```

### 로컬 개발

```bash
# 개발 서버 실행 (http://localhost:5173)
npm run dev

# 모바일 디바이스에서 테스트
# 같은 WiFi 네트워크에서 http://[컴퓨터IP]:5173 접속
```

**주의**: 카메라 권한은 HTTPS 환경에서만 작동합니다. 로컬 개발 시에는 localhost는 예외적으로 HTTP에서도 작동합니다.

### 프로덕션 빌드

```bash
# 프로덕션 빌드 (dist/ 폴더 생성)
npm run build

# 빌드 결과 미리보기
npm run preview
```

---

## 📱 QR 코드 시스템

### QR 코드 - 3D 모델 매핑

| QR 파일 | QR 내용 | 로드되는 모델 |
|---------|---------|---------------|
| `qr-1.png` | `"1"` | 온누리 교회 01 (`church-model-01`) |
| `qr-2.png` | `"2"` | 온누리 교회 02 (`church-model-02`) |
| `qr-3.png` | `"3"` | 온누리 교회 03 (`church-model-03`) |

### 지원되는 QR 포맷

QR 코드는 다음 형식을 모두 지원합니다:

1. **직접 매칭**: `MODEL_CHURCH_01`, `MODEL_CHURCH_02`, `MODEL_CHURCH_03`
2. **숫자 매칭**: `1`, `2`, `3`
3. **URL 파라미터**: `https://example.com?model=MODEL_CHURCH_01`
4. **부분 문자열**: `church_01`, `CHURCH_02` 등

매칭 로직은 [src/model-config.js](js-ar-poc/src/model-config.js)에 구현되어 있습니다.

### QR 코드 추가하기

1. **3D 모델 준비**:
   - GLB 포맷 (Android용)
   - USDZ 포맷 (iOS용)
   - `public/assets/models/` 에 저장

2. **model-config.js 업데이트**:
```javascript
export const MODEL_MAPPING = {
  'MODEL_CHURCH_04': {
    id: 'church_04',
    name: '온누리 교회 04',
    description: '온누리 교회 40주년 기념 모델 4',
    glb: '/assets/models/church-model-04.glb',
    usdz: '/assets/models/church-model-04.usdz',
    scale: '1 1 1',
    preload: true
  }
};
```

3. **QR 코드 생성**:
   - 내용: `"4"` 또는 `"MODEL_CHURCH_04"`
   - [QR Code Generator](https://www.qr-code-generator.com/) 등 사용
   - `public/qr-codes/qr-4.png`로 저장

---

## 🌐 배포

### Vercel 배포 (추천)

```bash
# Vercel CLI 설치
npm install -g vercel

# 배포
cd js-ar-poc
vercel --prod
```

### Netlify 배포

```bash
# Netlify CLI 설치
npm install -g netlify-cli

# 배포
cd js-ar-poc
npm run build
netlify deploy --prod --dir=dist
```

### ⚠️ 배포 필수 요구사항

1. **HTTPS 필수**: AR Quick Look 및 Scene Viewer는 HTTPS 없이 작동하지 않음
2. **CORS 설정**: 3D 모델 파일 로딩을 위해 필요
3. **SPA 라우팅**: 모든 요청을 `index.html`로 리다이렉트
4. **MIME 타입 설정**:
   - `.glb` → `model/gltf-binary`
   - `.usdz` → `model/vnd.usdz+zip`

Vercel/Netlify는 이러한 설정을 자동으로 처리합니다.

---

## 🧪 테스트

### 로컬 테스트 체크리스트

- [ ] iOS Safari에서 QR 스캔
- [ ] Android Chrome에서 QR 스캔
- [ ] QR 스캔 → 체크마크 애니메이션 표시
- [ ] 3D 모델 뷰어에서 회전/확대
- [ ] AR 가이드 화면 표시
- [ ] AR Quick Look 실행 (iOS)
- [ ] Scene Viewer 실행 (Android)
- [ ] 3개 QR 코드 모두 테스트
- [ ] 각 모델이 올바르게 로드되는지 확인
- [ ] AR에서 모델 배치 및 사진 촬영
- [ ] 온보딩 "다음에 하기" 기능
- [ ] WebView 감지 및 경고 메시지

### 플랫폼별 테스트

**iOS (Safari)**:
- AR Quick Look이 자동으로 USDZ 모델 사용
- 네이티브 AR 앱으로 전환
- 바닥 감지 및 그림자 자동 적용

**Android (Chrome)**:
- Scene Viewer가 GLB 모델 사용
- Google AR Core로 AR 세션 시작
- ARCore 미설치 시 자동 설치 안내

---

## 🛠️ 개발 가이드

### 주요 모듈 설명

#### [model-config.js](js-ar-poc/src/model-config.js)
- QR 코드 → 3D 모델 매핑 로직
- 다양한 매칭 전략 구현 (직접, 숫자, URL, 부분 문자열)
- 모델 메타데이터 관리

#### [model-viewer-ar-manager.js](js-ar-poc/src/model-viewer-ar-manager.js)
- model-viewer 초기화 및 관리
- 동적 모델 로딩 (QR 스캔 시)
- iOS AR Quick Look / Android Scene Viewer 통합
- AR 세션 상태 관리

#### [ios-qr-scanner.js](js-ar-poc/src/ios-qr-scanner.js)
- 카메라 스트림 처리
- jsQR를 이용한 실시간 QR 코드 인식
- 체크마크 애니메이션 및 사진 캡처
- QR 스캔 UI 렌더링

#### [platform-detector.js](js-ar-poc/src/platform-detector.js)
- iOS/Android 감지
- WebView 감지 (카카오톡, 인스타그램, 페이스북 등)
- Chrome 버전 체크 (Scene Viewer 지원 확인)
- WebXR API 지원 확인

#### [ar-guide-screen.js](js-ar-poc/src/ar-guide-screen.js)
- AR 실행 전 조작 가이드 표시
- 3단계 가이드 슬라이드
- AR 버튼 클릭 시 자동 표시

#### [camera-permission-screen.js](js-ar-poc/src/camera-permission-screen.js)
- 카메라 권한 요청 UI
- 권한 거부 시 설정 안내
- 우아한 에러 핸들링

#### [onboarding-screen.js](js-ar-poc/src/onboarding-screen.js)
- 첫 방문자 온보딩 시스템
- "다음에 하기" 기능 (localStorage 저장)
- 3단계 슬라이드 UI

---

## 📖 관련 문서

- [Google model-viewer 공식 문서](https://modelviewer.dev/)
- [AR Quick Look 가이드 (Apple)](https://developer.apple.com/augmented-reality/quick-look/)
- [Scene Viewer 가이드 (Google)](https://developers.google.com/ar/develop/scene-viewer)
- [jsQR 라이브러리](https://github.com/cozmo/jsQR)
- [Vite 공식 문서](https://vitejs.dev/)

---

## 📄 라이선스

MIT License

Copyright (c) 2025 Onnuri Church

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

---

**Made with ❤️ for Onnuri Church 40th Anniversary**
