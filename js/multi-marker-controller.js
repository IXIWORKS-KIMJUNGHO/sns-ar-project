/**
 * 다중 마커 관리 시스템
 * 마커별로 다른 오브젝트와 컨텐츠 표시
 */

class MultiMarkerController {
    constructor() {
        this.markers = {
            '1984': {
                id: 'marker-1984',
                title: '온누리교회 설립',
                description: '1984년 하나님의 은혜로 첫 걸음을 시작했습니다.',
                object: {
                    type: 'box',
                    color: '#8B4513',
                    animation: 'slow'
                }
            },
            '1990s': {
                id: 'marker-1990s',
                title: '성장기',
                description: '1990년대 교회가 빠르게 성장했습니다.',
                object: {
                    type: 'cylinder',
                    color: '#2E8B57',
                    animation: 'medium'
                }
            },
            '2000s': {
                id: 'marker-2000s',
                title: '발전기',
                description: '2000년대 현대적인 교회로 발전했습니다.',
                object: {
                    type: 'sphere',
                    color: '#4169E1',
                    animation: 'fast'
                }
            },
            '2024': {
                id: 'marker-2024',
                title: '40주년 기념',
                description: '2024년 40주년을 맞아 새로운 도약을 준비합니다.',
                object: {
                    type: 'octahedron',
                    color: '#FFD700',
                    animation: 'pulse'
                }
            }
        };

        this.currentMarker = null;
        this.init();
    }

    init() {
        // 각 마커에 이벤트 리스너 등록
        Object.keys(this.markers).forEach(year => {
            const marker = document.getElementById(this.markers[year].id);
            if (marker) {
                this.setupMarkerEvents(marker, year);
            }
        });
    }

    setupMarkerEvents(markerElement, year) {
        const markerData = this.markers[year];

        // 마커 발견 시
        markerElement.addEventListener('markerFound', () => {
            console.log(`${year} 마커 발견!`);
            this.onMarkerFound(year);
        });

        // 마커 손실 시
        markerElement.addEventListener('markerLost', () => {
            console.log(`${year} 마커 손실`);
            this.onMarkerLost(year);
        });
    }

    onMarkerFound(year) {
        this.currentMarker = year;
        const markerData = this.markers[year];

        // AR 상태 업데이트
        this.updateARStatus('found', `${markerData.title} 인식됨`);

        // 정보 패널 업데이트
        this.updateInfoPanel(markerData.title, markerData.description);

        // 특별 효과 추가 (선택사항)
        this.addSpecialEffects(year);

        // 마커별 맞춤 동작
        this.triggerMarkerSpecificAction(year);
    }

    onMarkerLost(year) {
        this.currentMarker = null;

        // AR 상태 업데이트
        this.updateARStatus('scanning', '마커를 찾는 중...');

        // 정보 패널 숨기기
        const infoPanel = document.getElementById('info-panel');
        if (infoPanel) {
            infoPanel.style.display = 'none';
        }
    }

    updateARStatus(status, text) {
        const indicator = document.querySelector('.status-indicator');
        const statusText = document.querySelector('.status-text');
        
        if (indicator && statusText) {
            indicator.classList.remove('scanning', 'error');
            if (status !== 'found') {
                indicator.classList.add(status);
            }
            statusText.textContent = text;
        }
    }

    updateInfoPanel(title, description) {
        const infoPanel = document.getElementById('info-panel');
        const titleElement = document.getElementById('period-title');
        const descElement = document.getElementById('period-description');

        if (infoPanel && titleElement && descElement) {
            titleElement.textContent = title;
            descElement.textContent = description;
            infoPanel.style.display = 'block';
            infoPanel.classList.add('spring-enter');
        }
    }

    addSpecialEffects(year) {
        // 마커별 특별 효과
        switch(year) {
            case '1984':
                this.addFoundationEffect();
                break;
            case '1990s':
                this.addGrowthEffect();
                break;
            case '2000s':
                this.addModernEffect();
                break;
            case '2024':
                this.addAnniversaryEffect();
                break;
        }
    }

    addFoundationEffect() {
        // 1984년 설립 효과 - 따뜻한 황금빛
        document.body.style.boxShadow = 'inset 0 0 100px rgba(255, 215, 0, 0.1)';
    }

    addGrowthEffect() {
        // 1990년대 성장 효과 - 생명력 있는 녹색
        document.body.style.boxShadow = 'inset 0 0 100px rgba(46, 139, 87, 0.1)';
    }

    addModernEffect() {
        // 2000년대 발전 효과 - 현대적인 파란색
        document.body.style.boxShadow = 'inset 0 0 100px rgba(65, 105, 225, 0.1)';
    }

    addAnniversaryEffect() {
        // 2024년 40주년 효과 - 축하 골드
        document.body.style.boxShadow = 'inset 0 0 100px rgba(255, 215, 0, 0.15)';
        
        // 특별 애니메이션 효과
        this.triggerCelebrationAnimation();
    }

    triggerCelebrationAnimation() {
        // 40주년 축하 애니메이션
        const captureBtn = document.getElementById('capture-btn');
        if (captureBtn) {
            captureBtn.style.animation = 'celebration-pulse 2s infinite';
        }
    }

    triggerMarkerSpecificAction(year) {
        // 마커별 특별 동작
        const actions = {
            '1984': () => {
                console.log('설립 스토리 시작');
                // 설립 관련 특별 컨텐츠 로드
            },
            '1990s': () => {
                console.log('성장 스토리 시작');
                // 성장 관련 특별 컨텐츠 로드
            },
            '2000s': () => {
                console.log('발전 스토리 시작');
                // 현대화 관련 특별 컨텐츠 로드
            },
            '2024': () => {
                console.log('40주년 기념 시작');
                // 기념 이벤트 시작
                this.start40thAnniversaryEvent();
            }
        };

        if (actions[year]) {
            actions[year]();
        }
    }

    start40thAnniversaryEvent() {
        // 40주년 특별 이벤트
        setTimeout(() => {
            if (this.currentMarker === '2024') {
                alert('🎉 온누리교회 40주년을 축하합니다! 🎉');
            }
        }, 2000);
    }

    // 현재 인식된 마커 정보 반환
    getCurrentMarkerInfo() {
        return this.currentMarker ? this.markers[this.currentMarker] : null;
    }

    // 특정 마커의 3D 오브젝트 동적 변경
    changeMarkerObject(year, newObjectConfig) {
        const marker = document.getElementById(this.markers[year].id);
        if (marker) {
            // 기존 오브젝트 제거
            const existingObject = marker.querySelector('a-box, a-cylinder, a-sphere, a-octahedron');
            if (existingObject) {
                existingObject.remove();
            }

            // 새 오브젝트 생성
            const newObject = document.createElement(`a-${newObjectConfig.type}`);
            newObject.setAttribute('position', '0 0.5 0');
            newObject.setAttribute('material', `color: ${newObjectConfig.color}`);
            newObject.setAttribute('animation', `property: rotation; to: 0 360 0; loop: true; dur: ${newObjectConfig.duration || 5000}`);
            
            marker.appendChild(newObject);
        }
    }
}

// 전역 인스턴스 생성
let multiMarkerController;

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    multiMarkerController = new MultiMarkerController();
    
    // 전역 접근 가능하게 설정
    window.multiMarkerController = multiMarkerController;
});

// CSS 애니메이션 추가
const style = document.createElement('style');
style.textContent = `
    @keyframes celebration-pulse {
        0%, 100% { 
            transform: scale(1);
            box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
        }
        50% { 
            transform: scale(1.1);
            box-shadow: 0 0 40px rgba(255, 215, 0, 0.8);
        }
    }
`;
document.head.appendChild(style);