# 온누리교회 40주년 AR 프로젝트

온누리교회 40년 건물 변천사를 WebAR로 시각화하는 프로젝트입니다.

## 📱 프로젝트 개요

- **목적**: 교회 40년간의 건물 변천사를 AR로 체험
- **기술**: WebAR (AR.js + A-Frame)
- **대상**: 성도들의 모바일 디바이스 (Android/iOS)
- **방식**: 이미지 마커 기반 AR

## 🏗️ 프로젝트 구조

```
sns-ar-project/
├── index.html                 # 메인 AR 웹페이지
├── README.md                  # 프로젝트 설명서
├── ar-project.md             # 초기 요구사항
├── DESIGN.md                 # 시스템 설계 문서
├── WORKFLOW.md               # 개발 워크플로우
│
├── assets/                   # 리소스 파일들
│   ├── markers/             # AR 마커 이미지 파일
│   │   ├── church-logo.patt # 교회 로고 마커
│   │   └── hiro.patt        # 테스트용 기본 마커
│   │
│   ├── models/              # 3D 모델 파일 (GLB/GLTF)
│   │   ├── church-1984.glb  # 1984년 교회 모델
│   │   ├── church-1995.glb  # 1995년 교회 모델
│   │   └── church-current.glb # 현재 교회 모델
│   │
│   ├── images/              # 역사적 사진 및 이미지
│   │   ├── 1984-founding.jpg
│   │   └── timeline-bg.jpg
│   │
│   └── audio/               # 설명 음성 파일 (선택사항)
│       └── narration.mp3
│
├── js/                      # JavaScript 파일들
│   ├── ar-controller.js     # AR 로직 관리
│   ├── timeline.js          # 시대별 전환 기능
│   └── utils.js             # 유틸리티 함수
│
├── css/                     # 스타일시트
│   ├── styles.css           # 메인 스타일
│   └── responsive.css       # 모바일 반응형 스타일
│
└── data/                    # 데이터 파일들
    ├── timeline.json        # 변천사 메타데이터
    └── config.json          # 앱 설정 정보
```

## 🔧 기술 스택

### Core Technologies
- **AR.js**: WebAR 라이브러리
- **A-Frame**: VR/AR 프레임워크
- **HTML5**: 웹 표준
- **JavaScript**: 인터랙션 로직

### Development Tools
- **Git**: 버전 관리
- **VS Code**: 코드 에디터 (Live Server 확장 권장)
- **Blender**: 3D 모델 제작 (선택사항)

## 🚀 시작하기

### 1. 개발 환경 설정
```bash
# 프로젝트 클론
git clone https://github.com/IXIWORKS-KIMJUNGHO/sns-ar-project.git
cd sns-ar-project

# 로컬 웹서버 실행 (VS Code Live Server 또는)
python -m http.server 8000
# 또는 Node.js
npx serve .
```

### 2. 모바일에서 테스트
1. 컴퓨터와 같은 WiFi에 연결된 모바일로 접속
2. HTTPS 환경 필요 (카메라 접근 권한)
3. Hiro 마커 출력해서 AR 테스트

### 3. 개발 진행 단계
1. **1주차**: 기본 마커 + 3D 박스
2. **2주차**: 교회 마커 + 간단한 건물 모델  
3. **3주차**: 시대별 모델 2-3개 + 전환 기능
4. **4주차**: UI 개선 + 스크린샷 기능

## 📋 주요 파일 설명

### `index.html`
메인 AR 웹페이지. AR.js와 A-Frame을 로드하고 AR 환경을 구성합니다.

### `js/ar-controller.js`
AR 관련 로직을 관리하는 메인 JavaScript 파일입니다.
- 마커 인식 처리
- 3D 모델 로딩 및 전환
- 사용자 인터랙션 처리

### `data/timeline.json`
교회 변천사 데이터를 JSON 형태로 저장합니다.
```json
{
  "periods": [
    {
      "year": "1984",
      "title": "교회 설립",
      "model": "assets/models/church-1984.glb",
      "description": "온누리교회의 시작..."
    }
  ]
}
```

### `assets/markers/`
AR 인식에 사용되는 마커 패턴 파일들을 저장합니다.
- `.patt` 파일: AR.js 마커 패턴
- 고대비, 복잡한 패턴 권장

### `assets/models/`
3D 모델 파일들을 저장합니다.
- GLTF/GLB 형식 권장
- 파일 크기 < 5MB
- 폴리곤 < 5,000개 (모바일 성능 고려)

## 📱 모바일 호환성

### 지원 브라우저
- **iOS**: Safari 11.3+
- **Android**: Chrome 67+, Samsung Internet

### 성능 최적화
- 3D 모델 최적화 (Draco 압축)
- 텍스처 크기 제한 (512x512px)
- 프리로딩 및 캐싱 전략

## 🔍 개발 가이드

### JavaScript 초보자 팁
1. **HTML 기반 시작**: A-Frame 선언적 구조 활용
2. **복사-붙여넣기**: AR.js 공식 예제부터 시작
3. **점진적 학습**: 기능별로 나누어 이해

### Unity 경험자 연결점
- **좌표계**: Unity와 유사한 3D 좌표계
- **머티리얼**: PBR 머티리얼 개념 동일
- **모델링**: Blender → Unity → WebGL 파이프라인

## 🐛 문제 해결

### 자주 발생하는 문제
1. **마커 인식 안됨**: 조명 확인, 마커 크기 조정
2. **모델 로딩 느림**: 파일 크기 최적화
3. **iOS에서 안보임**: HTTPS 환경 확인
4. **성능 저하**: Chrome DevTools로 성능 분석

### 디버깅 도구
- Chrome DevTools (Mobile 시뮬레이션)
- AR.js 공식 마커 테스터
- A-Frame Inspector

## 📚 학습 자료

- [AR.js 공식 문서](https://ar-js-org.github.io/AR.js-Docs/)
- [A-Frame School](https://aframe.io/aframe-school/)
- [WebXR 표준](https://www.w3.org/TR/webxr/)
- [Blender 기초 튜토리얼](https://www.blender.org/support/tutorials/)

## 📄 라이선스

MIT License - 자세한 내용은 LICENSE 파일을 참조하세요.

## 👥 기여하기

1. Fork the Project
2. Create your Feature Branch
3. Commit your Changes  
4. Push to the Branch
5. Open a Pull Request

---

**개발 시작**: WORKFLOW.md를 참조하여 단계별로 개발을 진행하세요!