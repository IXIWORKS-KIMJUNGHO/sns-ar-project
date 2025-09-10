# AR.js 커스텀 마커 생성 워크플로우

## 1단계: 마커 이미지 준비

### 이미지 요구사항
- **크기**: 512x512px (정사방형)
- **색상**: 흑백 고대비 이미지
- **패턴**: 복잡하고 비대칭적인 패턴
- **품질**: 선명하고 노이즈 없는 이미지

### 온누리교회 마커 아이디어
1. **교회 로고 + 40주년 텍스트**
2. **십자가 + 건물 실루엣**
3. **QR코드 스타일 패턴**

## 2단계: AR.js Marker Training 사이트 사용

### 마커 생성 과정
1. https://jeromeetienne.github.io/AR.js/three.js/examples/marker-training/examples/generator.html 접속
2. 준비한 이미지 업로드
3. "Download Marker" 클릭하여 .patt 파일 다운로드
4. 생성된 마커 이미지도 함께 다운로드

### 생성 파일들
- `pattern-marker.patt` - AR.js가 인식할 패턴 파일
- `marker.png` - 실제 인쇄용 마커 이미지

## 3단계: 프로젝트에 마커 통합

### 파일 구조
```
assets/
  markers/
    onnuri-church.patt
    onnuri-church-marker.png
```

### HTML 코드 수정
```html
<!-- 기존 Hiro 마커 -->
<a-marker preset="hiro" id="main-marker">

<!-- 커스텀 마커로 변경 -->
<a-marker 
    type="pattern" 
    url="assets/markers/onnuri-church.patt"
    id="main-marker">
```

## 4단계: 마커 품질 최적화

### 테스트 과정
1. 다양한 조명 환경에서 테스트
2. 여러 거리에서 인식률 확인
3. 다양한 각도에서 안정성 검증

### 최적화 팁
- 마커 주변에 여백 확보
- 인쇄 품질 최대화
- 광택 없는 용지 사용
- 평평한 표면에 부착

## 5단계: 다중 마커 시스템 (선택사항)

### 연도별 마커 생성
```html
<!-- 1984년 마커 -->
<a-marker type="pattern" url="assets/markers/1984.patt" id="marker-1984">
    <a-box material="color: #8B4513;" animation="property: rotation; to: 0 360 0; loop: true; dur: 5000"></a-box>
</a-marker>

<!-- 2024년 마커 -->
<a-marker type="pattern" url="assets/markers/2024.patt" id="marker-2024">
    <a-box material="color: #4169E1;" animation="property: rotation; to: 0 360 0; loop: true; dur: 5000"></a-box>
</a-marker>
```

## 6단계: 배포 및 사용법

### 사용자 가이드 생성
1. 마커 이미지 제공
2. 인쇄 가이드 작성
3. AR 사용법 안내
4. 문제해결 가이드

### 마케팅 활용
- 교회 게시판에 마커 부착
- 팜플렛에 마커 인쇄
- 소셜미디어로 마커 공유
- QR코드와 함께 배포

## 트러블슈팅

### 인식 문제
- 조명 부족 → 밝은 환경에서 사용
- 마커 손상 → 새 마커로 교체
- 각도 문제 → 정면에서 촬영

### 성능 최적화
- 마커 크기 적절히 조정
- 3D 모델 복잡도 조절
- 텍스처 품질 최적화