# 온누리교회 40주년 AR 프로젝트

QR 코드/마커를 스캔하면 온누리교회 3D 모델을 AR로 체험할 수 있는 웹 애플리케이션입니다.

## 📱 주요 기능

- **QR/마커 인식**: 카메라로 마커를 스캔하면 3D 모델 표시
- **3D 모델 렌더링**: GLB 형식의 교회 건물 모델 AR 표시
- **스크린샷 캡처**: AR 장면을 사진으로 저장
- **모바일 최적화**: iOS/Android 브라우저 지원

## 🚀 빠른 시작

### 1. 로컬 서버 실행
```bash
# Python
python -m http.server 8000

# Node.js
npx serve .

# VS Code Live Server 확장 사용
```

### 2. 브라우저 접속
- PC: `http://localhost:8000`
- 모바일: `http://[컴퓨터IP]:8000`

### 3. 마커 테스트
- **Hiro 마커** (기본): [다운로드](https://raw.githubusercontent.com/AR-js-org/AR.js/master/data/images/hiro.png)
- **커스텀 마커**: `assets/markers/onnuri-church.patt`

## 📁 프로젝트 구조

```
sns-ar-project/
├── index.html                 # 메인 AR 페이지
├── qr-test.html              # 마커 테스트 페이지
├── README.md                 # 프로젝트 문서
│
├── js/
│   └── ar-controller.js      # AR 로직 컨트롤러
│
├── css/
│   └── styles.css            # 스타일시트
│
├── data/
│   └── church-config.json    # 설정 파일
│
└── assets/
    ├── markers/
    │   └── onnuri-church.patt # 커스텀 마커 패턴
    └── models/
        └── church-model.glb   # 교회 3D 모델
```

## ⚙️ 설정

`data/church-config.json` 파일에서 수정 가능:
- 3D 모델 크기: `scale`
- 회전 애니메이션: `autoRotate`
- 정보 텍스트: `info`

## 📱 모바일 테스트

1. **카메라 권한 허용**
2. **마커 준비** (화면 또는 인쇄)
3. **카메라로 스캔**
4. **3D 모델 확인**

## 🔧 기술 스택

- **AR.js**: WebAR 라이브러리
- **A-Frame**: 3D/VR/AR 프레임워크
- **HTML5/CSS3/JavaScript**: 웹 표준

## ⚠️ 요구사항

- **HTTPS** 또는 localhost (카메라 접근)
- **모바일 브라우저**: Chrome (Android), Safari (iOS)
- **마커**: 평평하고 밝은 환경에서 최적

## 📝 라이선스

온누리교회 40주년 기념 프로젝트

---

**문제 해결**: 
- 마커 인식 안 됨 → 조명 개선, 마커 크기 확대
- 3D 모델 안 보임 → GLB 파일 경로 확인
- 카메라 오류 → HTTPS 환경 필요