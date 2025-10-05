/**
 * Pre-AR Guide Screen
 * AR 실행 전 사용자에게 Object Mode/Scene Viewer 사용법 안내
 */

import { platformDetector } from './platform-detector.js';

export class ARGuideScreen {
  constructor() {
    this.guideElement = null;
    this.isVisible = false;
  }

  /**
   * 가이드 화면 생성
   */
  createGuideHTML() {
    const platform = platformDetector.isIOS() ? 'ios' : 'android';
    const viewerName = platformDetector.getARViewerName();

    return `
      <style>
        #ar-guide-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.95);
          z-index: 10001;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          animation: fadeIn 0.3s ease-out;
        }

        @keyframes fadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }

        .ar-guide-content {
          max-width: 90%;
          text-align: center;
          color: white;
        }

        .ar-guide-mockup {
          position: relative;
          width: 280px;
          height: 500px;
          margin: 0 auto 30px;
          background: #1a1a1a;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 10px 40px rgba(0,0,0,0.5);
        }

        .ar-guide-screen {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 100%);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .ar-guide-model {
          width: 150px;
          height: 150px;
          background: url('assets/models/church-icon.png') center/contain no-repeat;
          opacity: 0.7;
        }

        /* AR 아이콘 위치 표시 (플랫폼별) */
        .ar-icon-indicator {
          position: absolute;
          ${platform === 'ios' ? 'top: 20px; right: 20px;' : 'bottom: 80px; right: 50%;'}
          ${platform === 'ios' ? '' : 'transform: translateX(50%);'}
          width: 60px;
          height: 60px;
          background: rgba(255, 255, 255, 0.2);
          border: 3px solid #00ff00;
          border-radius: ${platform === 'ios' ? '8px' : '50%'};
          display: flex;
          align-items: center;
          justify-content: center;
          animation: pulse 1.5s infinite;
        }

        .ar-icon-indicator::before {
          content: 'AR';
          color: #00ff00;
          font-size: 18px;
          font-weight: bold;
        }

        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(0, 255, 0, 0.7);
          }
          50% {
            box-shadow: 0 0 0 15px rgba(0, 255, 0, 0);
          }
        }

        /* 화살표 애니메이션 */
        .ar-arrow {
          position: absolute;
          ${platform === 'ios' ? 'top: -30px; right: 35px;' : 'bottom: 150px; right: 50%;'}
          ${platform === 'ios' ? '' : 'transform: translateX(50%) rotate(180deg);'}
          font-size: 40px;
          animation: bounce 1s infinite;
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0) ${platform === 'ios' ? '' : 'rotate(180deg)'}; }
          50% { transform: translateY(-10px) ${platform === 'ios' ? '' : 'rotate(180deg)'}; }
        }

        .ar-guide-text {
          font-size: 20px;
          font-weight: bold;
          margin-bottom: 15px;
          color: #00ff00;
        }

        .ar-guide-description {
          font-size: 16px;
          color: #aaa;
          line-height: 1.5;
        }

        .ar-guide-viewer-name {
          font-size: 14px;
          color: #666;
          margin-top: 10px;
        }
      </style>

      <div id="ar-guide-overlay">
        <div class="ar-guide-content">
          <div class="ar-guide-mockup">
            <div class="ar-guide-screen">
              <div class="ar-guide-model"></div>
            </div>
            <div class="ar-icon-indicator"></div>
            <div class="ar-arrow">👆</div>
          </div>

          <div class="ar-guide-text">
            이 아이콘을 눌러주세요
          </div>
          <div class="ar-guide-description">
            3D 모델이 보이면<br>
            ${platform === 'ios' ? '오른쪽 위' : '하단'} AR 아이콘을 터치하세요
          </div>
          <div class="ar-guide-viewer-name">
            ${viewerName}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * 로딩 화면에 가이드 콘텐츠 추가 (오버레이 대신)
   * @param {HTMLElement} loadingScreen - 로딩 화면 엘리먼트
   * @returns {HTMLElement} 가이드 엘리먼트
   */
  createLoadingGuideContent() {
    const guide = document.createElement('div');
    guide.id = 'ar-loading-guide';
    guide.innerHTML = `
      <style>
        #ar-loading-guide {
          margin-top: 30px;
          text-align: center;
          color: white;
          animation: fadeInGuide 0.5s ease-out;
          max-width: 90%;
        }

        @keyframes fadeInGuide {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        .ar-guide-title {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 25px;
          color: #00ff00;
          text-shadow: 0 2px 8px rgba(0,255,0,0.3);
        }

        .ar-controls-list {
          background: rgba(255,255,255,0.1);
          border-radius: 20px;
          padding: 25px 20px;
          backdrop-filter: blur(10px);
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        }

        .ar-control-item {
          display: flex;
          align-items: center;
          margin-bottom: 20px;
          text-align: left;
        }

        .ar-control-item:last-child {
          margin-bottom: 0;
        }

        .ar-control-icon {
          font-size: 32px;
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255,255,255,0.15);
          border-radius: 12px;
          margin-right: 15px;
          flex-shrink: 0;
        }

        .ar-control-text {
          flex: 1;
        }

        .ar-control-title {
          font-size: 16px;
          font-weight: 700;
          margin-bottom: 4px;
          color: white;
        }

        .ar-control-desc {
          font-size: 13px;
          color: rgba(255,255,255,0.8);
          line-height: 1.3;
        }

        .ar-guide-footer {
          margin-top: 20px;
          font-size: 14px;
          color: rgba(255,255,255,0.7);
          font-style: italic;
        }
      </style>

      <div class="ar-guide-title">
        🎮 AR 조작법
      </div>

      <div class="ar-controls-list">
        <div class="ar-control-item">
          <div class="ar-control-icon">👆</div>
          <div class="ar-control-text">
            <div class="ar-control-title">오브젝트 이동</div>
            <div class="ar-control-desc">화면을 터치하여 원하는 위치로 옮길 수 있어요</div>
          </div>
        </div>

        <div class="ar-control-item">
          <div class="ar-control-icon">🔄</div>
          <div class="ar-control-text">
            <div class="ar-control-title">모델 회전</div>
            <div class="ar-control-desc">두 손가락으로 드래그하여 모델을 돌려보세요</div>
          </div>
        </div>

        <div class="ar-control-item">
          <div class="ar-control-icon">🤏</div>
          <div class="ar-control-text">
            <div class="ar-control-title">크기 조절</div>
            <div class="ar-control-desc">핀치 줌으로 모델 크기를 자유롭게 변경하세요</div>
          </div>
        </div>

        <div class="ar-control-item">
          <div class="ar-control-icon">📸</div>
          <div class="ar-control-text">
            <div class="ar-control-title">사진 촬영</div>
            <div class="ar-control-desc">완벽한 순간을 카메라 버튼으로 담아보세요</div>
          </div>
        </div>
      </div>

      <div class="ar-guide-footer">
        잠시 후 AR 화면이 실행됩니다...
      </div>
    `;

    return guide;
  }

  /**
   * 로딩 화면에 가이드 표시
   * @param {number} duration - 표시 시간 (ms, 기본 3000ms)
   * @returns {Promise} 가이드 종료 후 resolve
   */
  showInLoadingScreen(duration = 3000) {
    return new Promise((resolve) => {
      console.log('[ARGuideScreen] Showing guide in loading screen...');

      const loadingScreen = document.getElementById('loading-screen');
      if (!loadingScreen) {
        console.warn('[ARGuideScreen] Loading screen not found');
        resolve();
        return;
      }

      // 로딩 메시지 숨김
      const loadingMessage = document.getElementById('loading-message');
      const spinner = loadingScreen.querySelector('.spinner');
      if (loadingMessage) loadingMessage.style.display = 'none';
      if (spinner) spinner.style.display = 'none';

      // 가이드 콘텐츠 추가
      const guideContent = this.createLoadingGuideContent();
      loadingScreen.appendChild(guideContent);

      this.isVisible = true;
      this.guideElement = guideContent;

      // 지정된 시간 후 로딩 화면 숨김 및 정리
      setTimeout(() => {
        if (loadingScreen) {
          loadingScreen.style.display = 'none';
        }
        this.isVisible = false;
        resolve();
      }, duration);
    });
  }

  /**
   * 가이드 화면 표시 (기존 전체 화면 오버레이 방식 - 하위 호환성)
   * @param {number} duration - 표시 시간 (ms, 기본 1500ms)
   * @returns {Promise} 가이드 종료 후 resolve
   */
  show(duration = 1500) {
    return new Promise((resolve) => {
      // 이미 표시 중이면 무시
      if (this.isVisible) {
        resolve();
        return;
      }

      console.log('[ARGuideScreen] Showing guide...');

      // 가이드 HTML 생성 및 추가
      const guideHTML = this.createGuideHTML();
      const container = document.createElement('div');
      container.innerHTML = guideHTML;
      this.guideElement = container.firstElementChild;
      document.body.appendChild(this.guideElement);

      this.isVisible = true;

      // 지정된 시간 후 자동 제거
      setTimeout(() => {
        this.hide();
        resolve();
      }, duration);
    });
  }

  /**
   * 가이드 화면 숨기기
   */
  hide() {
    if (!this.guideElement || !this.isVisible) return;

    console.log('[ARGuideScreen] Hiding guide...');

    // Fade out 애니메이션
    this.guideElement.style.animation = 'fadeIn 0.3s ease-out reverse';

    setTimeout(() => {
      if (this.guideElement && this.guideElement.parentElement) {
        this.guideElement.remove();
      }
      this.guideElement = null;
      this.isVisible = false;
    }, 300);
  }

  /**
   * 첫 방문 여부 체크
   */
  isFirstVisit() {
    return !localStorage.getItem('ar_guide_shown');
  }

  /**
   * 가이드 표시 기록
   */
  markAsShown() {
    localStorage.setItem('ar_guide_shown', 'true');
  }

  /**
   * 가이드 표시 기록 초기화 (테스트용)
   */
  resetGuideStatus() {
    localStorage.removeItem('ar_guide_shown');
    console.log('[ARGuideScreen] Guide status reset');
  }
}

// 싱글톤 인스턴스
export const arGuideScreen = new ARGuideScreen();
