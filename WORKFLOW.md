# 온누리교회 40주년 AR 프로젝트 구현 워크플로우

## 🚀 시작 단계: 오늘 바로 실행

### Step 1: 프로젝트 구조 생성 (30분)
```bash
# 폴더 구조 생성
mkdir -p assets/{markers,models,images,audio}
mkdir -p js css data
touch index.html js/ar-controller.js css/styles.css data/timeline.json
```

### Step 2: 기본 HTML 템플릿 작성 (30분)
```html
<!-- index.html 기본 구조 -->
<!DOCTYPE html>
<html>
<head>
    <title>온누리교회 40주년 AR</title>
    <script src="https://aframe.io/releases/1.4.0/aframe.min.js"></script>
    <script src="https://cdn.jsdelivr.net/gh/AR-js-org/AR.js@3.4.5/aframe/build/aframe-ar.min.js"></script>
</head>
<body style='margin : 0px; overflow: hidden;'>
    <a-scene embedded arjs>
        <!-- AR 마커와 3D 객체가 들어갈 공간 -->
        <a-marker preset="hiro">
            <a-box position="0 0.5 0" material="color: red;"></a-box>
        </a-marker>
        <a-entity camera></a-entity>
    </a-scene>
</body>
</html>
```

### Step 3: 첫 번째 테스트 (15분)
1. 웹서버 실행 (VS Code Live Server 또는 Python 서버)
2. 모바일에서 접속
3. Hiro 마커로 빨간 박스 표시 확인

### Step 4: Git 커밋 (15분)
```bash
git add .
git commit -m "Initial AR.js setup with basic marker test"
git push origin master
```

## 📅 주차별 개발 계획

### 1주차: 기본 환경 구축
- [x] 프로젝트 구조 생성
- [x] AR.js 환경 설정
- [x] 첫 번째 마커 테스트
- [ ] 모바일 브라우저 호환성 확인
- [ ] 기본 3D 모델 (정육면체 → 간단한 집 모양)

### 2주차: 교회 마커 준비
- [ ] 교회 로고/이미지를 마커로 변환
- [ ] 커스텀 마커 테스트
- [ ] 마커 인식률 최적화
- [ ] 기본 교회 3D 모델 제작 (Blender/Unity)

### 3주차: 콘텐츠 추가
- [ ] timeline.json 데이터 구조 설계
- [ ] JavaScript로 시대별 모델 전환 로직
- [ ] 기본 UI 버튼 (이전/다음)
- [ ] 2-3개 시대 구분으로 테스트

### 4주차: UX 개선
- [ ] 정보 패널 (연도, 설명 텍스트)
- [ ] 로딩 화면
- [ ] 스크린샷 기능
- [ ] 모바일 반응형 디자인

## 🎯 JavaScript 학습 로드맵

### Level 1: HTML 기반 (1주차)
```html
<!-- 선언적 방식으로 시작 -->
<a-marker preset="custom" type="pattern" url="assets/markers/church.patt">
    <a-gltf-model src="assets/models/church-1984.glb" 
                  scale="0.1 0.1 0.1" 
                  position="0 0 0">
    </a-gltf-model>
</a-marker>
```

### Level 2: 기본 JavaScript (2-3주차)
```javascript
// 간단한 모델 전환
function switchModel(year) {
    const model = document.querySelector('a-gltf-model');
    model.setAttribute('src', `assets/models/church-${year}.glb`);
}
```

### Level 3: 구조화된 JavaScript (4주차+)
```javascript
class ARController {
    constructor() {
        this.currentYear = 0;
        this.timeline = [];
    }
    
    loadTimeline() {
        // timeline.json 로드 로직
    }
    
    nextPeriod() {
        // 다음 시대로 전환
    }
}
```

## 🔧 개발 도구 설정

### 필수 도구
1. **VS Code** + Live Server 확장
2. **Chrome DevTools** (모바일 디버깅)
3. **Blender** (3D 모델 제작, 무료)
4. **AR.js Marker Generator** (마커 생성)

### 권장 학습 자료
1. **AR.js 공식 문서**: https://ar-js-org.github.io/AR.js-Docs/
2. **A-Frame School**: https://aframe.io/aframe-school/
3. **Blender 기초**: YouTube "Blender Guru" 채널
4. **JavaScript 기초**: MDN Web Docs

## ⚠️ 주의사항 및 팁

### 개발 시 주의점
- **HTTPS 필수**: 카메라 접근을 위해 HTTPS 환경 필요
- **마커 품질**: 고대비, 복잡한 패턴의 마커 사용
- **모델 최적화**: 파일 크기 < 5MB, 폴리곤 < 5000개
- **브라우저 호환성**: iOS Safari, Android Chrome 우선 테스트

### 문제 해결
1. **마커 인식 안됨** → 조명 확인, 마커 크기 조정
2. **모델 로딩 느림** → 파일 크기 최적화, 압축
3. **JavaScript 에러** → 브라우저 콘솔 확인
4. **성능 이슈** → Chrome DevTools 성능 분석

## 📱 테스트 전략

### 기기별 테스트
- **iPhone Safari**: WebXR 폴리필 필요
- **Android Chrome**: 네이티브 WebXR 지원
- **저사양 기기**: 모델 품질 다운그레이드

### 단계별 검증
1. **로컬 테스트**: PC 브라우저에서 기본 동작 확인
2. **모바일 테스트**: 실제 마커로 AR 기능 검증
3. **성능 테스트**: 다양한 기기에서 프레임률 측정
4. **사용성 테스트**: 실제 사용자 (성도) 피드백 수집

## 🎉 성공 지표

### 1주차 목표
- [ ] 모바일에서 마커 인식되는 빨간 박스 표시

### 1개월 목표
- [ ] 교회 마커로 3D 교회 모델 표시
- [ ] 2-3개 시대 전환 가능
- [ ] 기본 UI 동작

### 최종 목표
- [ ] 5개 시대 구분으로 변천사 표시
- [ ] 스크린샷 촬영 및 저장
- [ ] 성도 20명 이상 테스트 완료

**다음 액션**: 먼저 위의 Step 1부터 시작해서 기본 프로젝트 구조를 만들어보세요!