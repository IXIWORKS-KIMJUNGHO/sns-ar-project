// Onboarding Screen Module
// 사용자 첫 방문 시 온보딩 경험 제공

import Nav from './nav.js';

export class OnboardingScreen {
  constructor() {
    this.currentStep = 0;
    this.totalSteps = 3;
    this.onComplete = null;
    this.hasSeenOnboarding = this.checkOnboardingStatus();

    console.log('[Onboarding] Initialized');
    console.log('[Onboarding] Has seen before:', this.hasSeenOnboarding);
  }

  /**
   * 온보딩 이미 본 적 있는지 확인
   */
  checkOnboardingStatus() {
    return localStorage.getItem('onnuri-ar-onboarding-seen') === 'true';
  }

  /**
   * 온보딩 완료 표시
   */
  markAsComplete() {
    localStorage.setItem('onnuri-ar-onboarding-seen', 'true');
    console.log('[Onboarding] ✅ Marked as complete');
  }

  /**
   * 온보딩 리셋 (디버그용)
   */
  static reset() {
    localStorage.removeItem('onnuri-ar-onboarding-seen');
    console.log('[Onboarding] Reset');
  }

  /**
   * 온보딩 표시 (항상 표시, 건너뛰기 가능)
   */
  show(onCompleteCallback) {
    console.log('[Onboarding] Showing onboarding...');

    this.onComplete = onCompleteCallback;
    this.currentStep = 0;
    this.render();
  }

  /**
   * 강제로 온보딩 표시 (다시 보기)
   */
  forceShow(onCompleteCallback) {
    this.onComplete = onCompleteCallback;
    this.currentStep = 0;
    this.render();
  }

  /**
   * 온보딩 화면 렌더링
   */
  render() {
    // 기존 온보딩 제거
    const existing = document.getElementById('onboarding-overlay');
    if (existing) existing.remove();

    // 온보딩 오버레이 생성
    const overlay = document.createElement('div');
    overlay.id = 'onboarding-overlay';
    overlay.innerHTML = this.getHTML();
    document.body.appendChild(overlay);

    // 이벤트 리스너 바인딩
    this.bindEvents();

    console.log('[Onboarding] Rendered step', this.currentStep + 1);
  }

  /**
   * 현재 단계에 맞는 HTML 반환
   */
  getHTML() {
    const steps = [
      this.getStep1HTML(),
      this.getStep2HTML(),
      this.getStep3HTML()
    ];

    return `
      <style>
        #onboarding-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: var(--gradient-primary);
          font-family: var(--font-primary);
          z-index: 100000;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          align-items: center;
          color: white;
          padding: max(40px, env(safe-area-inset-top)) 20px max(60px, env(safe-area-inset-bottom)) 20px;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
          animation: fadeIn 0.5s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .onboarding-header {
          text-align: center;
          margin-bottom: 24px;
          width: 100%;
        }

        .onboarding-header h1 {
          font-size: 32px;
          font-weight: 700;
          margin: 0 0 12px 0;
          text-shadow: 0 2px 10px rgba(0,0,0,0.2);
          line-height: 1.2;
        }

        .onboarding-header p {
          font-size: 16px;
          opacity: 0.9;
          margin: 0;
          line-height: 1.5;
        }

        .onboarding-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          width: 100%;
          max-width: 500px;
          margin-bottom: 20px;
          animation: slideUp 0.6s ease-out;
        }

        @keyframes slideUp {
          from {
            transform: translateY(30px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .step-icon {
          font-size: 56px;
          margin-bottom: var(--spacing-lg);
          animation: bounce 1s ease-in-out infinite;
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .step-title {
          font-size: var(--font-size-3xl);
          font-weight: var(--font-weight-bold);
          line-height: var(--line-height-tight);
          margin-bottom: var(--spacing-lg);
          text-align: center;
        }

        .step-description {
          font-size: var(--font-size-lg);
          line-height: var(--line-height-relaxed);
          text-align: center;
          margin-bottom: var(--spacing-xl);
          opacity: 0.95;
        }

        .step-list {
          background: rgba(255, 255, 255, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 20px;
          padding: 24px 20px;
          margin-bottom: var(--spacing-xl);
          width: 100%;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          animation: slideUp 0.4s ease-out;
        }

        .step-list-item {
          display: flex;
          align-items: flex-start;
          margin-bottom: var(--spacing-lg);
          font-size: var(--font-size-base);
          line-height: var(--line-height-normal);
        }

        .step-list-item:last-child {
          margin-bottom: 0;
        }

        .step-number {
          background: white;
          color: #667eea;
          width: 32px;
          height: 32px;
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: var(--font-weight-bold);
          margin-right: var(--spacing-md);
          flex-shrink: 0;
          box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
        }

        .step-text {
          flex: 1;
          padding-top: var(--spacing-xs);
        }

        .onboarding-footer {
          width: 100%;
          max-width: 500px;
          margin-top: auto;
          padding-top: 20px;
        }

        .progress-dots {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-bottom: 20px;
        }

        .progress-dot {
          width: 10px;
          height: 10px;
          border-radius: var(--radius-full);
          background: rgba(255,255,255,0.3);
          transition: all var(--transition-base);
        }

        .progress-dot.active {
          background: white;
          width: 32px;
          border-radius: var(--radius-sm);
        }

        .onboarding-buttons {
          display: flex;
          gap: var(--spacing-md);
        }

        .btn-skip, .btn-next, .btn-start {
          flex: 1;
          padding: 16px var(--spacing-xl);
          border: none;
          border-radius: var(--radius-full);
          font-family: var(--font-primary);
          font-size: var(--font-size-lg);
          font-weight: var(--font-weight-bold);
          cursor: pointer;
          transition: all var(--transition-fast);
          box-shadow: var(--shadow-lg);
        }

        .btn-skip {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.3);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }

        .btn-skip:hover {
          background: rgba(255, 255, 255, 0.25);
          border-color: rgba(255, 255, 255, 0.4);
          transform: translateY(-2px);
        }

        .btn-skip:active {
          transform: scale(0.97);
          background: rgba(255, 255, 255, 0.15);
        }

        .btn-next, .btn-start {
          background: white;
          color: #667eea;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        }

        .btn-next:hover, .btn-start:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
        }

        .btn-next:active, .btn-start:active {
          transform: scale(0.97);
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        }

        .highlight {
          color: #FFD700;
          font-weight: 700;
        }

        /* 스마트폰 최적화 */
        @media (max-height: 700px) {
          #onboarding-overlay {
            padding: var(--spacing-xl) var(--spacing-lg) var(--spacing-lg) var(--spacing-lg);
          }
          .onboarding-header h1 {
            font-size: var(--font-size-3xl);
          }
          .step-icon {
            font-size: 60px;
            margin-bottom: var(--spacing-lg);
          }
          .step-title {
            font-size: var(--font-size-2xl);
          }
          .step-description {
            font-size: var(--font-size-base);
          }
        }
      </style>
      ${Nav()}
      <div class="onboarding-header">
        <h1><i class="ph-bold ph-church"></i> Onnuri AR</h1>
        <p>증강현실로 만나는 새로운 경험</p>
      </div>

      <div class="onboarding-content">
        ${steps[this.currentStep]}
      </div>

      <div class="onboarding-footer">
        <div class="progress-dots">
          ${this.getProgressDotsHTML()}
        </div>
        <div class="onboarding-buttons">
          ${this.getButtonsHTML()}
        </div>
      </div>
    `;
  }

  /**
   * Step 1: 환영 및 소개
   */
  getStep1HTML() {
    return `
      <div class="step-icon"><i class="ph-fill ph-hand-waving"></i></div>
      <div class="step-title">환영합니다!</div>
      <div class="step-list">
        <div class="step-list-item">
          <span class="step-number"><i class="ph-fill ph-church"></i></span>
          <span class="step-text">
            <strong>3D 증강현실로</strong><br>
            온누리 교회를 체험하세요
          </span>
        </div>
        <div class="step-list-item">
          <span class="step-number"><i class="ph-bold ph-device-mobile"></i></span>
          <span class="step-text">
            <strong>앱 설치 없이</strong><br>
            브라우저만으로
          </span>
        </div>
      </div>
    `;
  }

  /**
   * Step 2: 사용 방법
   */
  getStep2HTML() {
    return `
      <div class="step-icon"><i class="ph-fill ph-book-open"></i></div>
      <div class="step-title">사용 방법</div>
      <div class="step-description">
        3단계로 간단하게 AR을 체험할 수 있습니다
      </div>
      <div class="step-list">
        <div class="step-list-item">
          <span class="step-number">1</span>
          <span class="step-text">
            <strong>QR 코드 스캔</strong><br>
            주보나 안내판의 QR 코드를 스캔하세요
          </span>
        </div>
        <div class="step-list-item">
          <span class="step-number">2</span>
          <span class="step-text">
            <strong>배치 위치 촬영</strong><br>
            AR 모델을 보고 싶은 위치를 사진으로 찍으세요
          </span>
        </div>
        <div class="step-list-item">
          <span class="step-number">3</span>
          <span class="step-text">
            <strong>AR 체험</strong><br>
            화면을 통해 실제 공간에 3D 모델이 나타납니다
          </span>
        </div>
      </div>
    `;
  }

  /**
   * Step 3: 시작 준비
   */
  getStep3HTML() {
    return `
      <div class="step-icon"><i class="ph-fill ph-rocket-launch"></i></div>
      <div class="step-title">시작 준비 완료!</div>
      <div class="step-description">
        이제 <span class="highlight">QR 코드</span>를 스캔하여<br>
        AR 체험을 시작하세요
      </div>
      <div class="step-list">
        <div class="step-list-item">
          <span class="step-number"><i class="ph-bold ph-lightbulb"></i></span>
          <span class="step-text">
            <strong>팁:</strong> 밝은 조명에서 더 선명하게 보입니다
          </span>
        </div>
        <div class="step-list-item">
          <span class="step-number"><i class="ph-bold ph-ruler"></i></span>
          <span class="step-text">
            <strong>팁:</strong> 모델과 1-2m 거리를 유지하세요
          </span>
        </div>
        <div class="step-list-item">
          <span class="step-number"><i class="ph-bold ph-speaker-high"></i></span>
          <span class="step-text">
            <strong>팁:</strong> 카메라 권한을 허용해주세요
          </span>
        </div>
      </div>
    `;
  }

  /**
   * 진행 상태 점 HTML
   */
  getProgressDotsHTML() {
    let html = '';
    for (let i = 0; i < this.totalSteps; i++) {
      const activeClass = i === this.currentStep ? 'active' : '';
      html += `<div class="progress-dot ${activeClass}"></div>`;
    }
    return html;
  }

  /**
   * 버튼 HTML
   */
  getButtonsHTML() {
    if (this.currentStep < this.totalSteps - 1) {
      // 첫 번째 ~ 두 번째 단계: 건너뛰기 + 다음
      return `
        <button class="btn-skip" id="onboarding-skip">건너뛰기</button>
        <button class="btn-next" id="onboarding-next">다음</button>
      `;
    } else {
      // 마지막 단계: 시작하기
      return `
        <button class="btn-start" id="onboarding-start">AR 체험 시작</button>
      `;
    }
  }

  /**
   * 이벤트 리스너 바인딩
   */
  bindEvents() {
    const skipBtn = document.getElementById('onboarding-skip');
    const nextBtn = document.getElementById('onboarding-next');
    const startBtn = document.getElementById('onboarding-start');

    if (skipBtn) {
      skipBtn.addEventListener('click', () => this.skip());
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => this.nextStep());
    }

    if (startBtn) {
      startBtn.addEventListener('click', () => this.complete());
    }
  }

  /**
   * 다음 단계
   */
  nextStep() {
    if (this.currentStep < this.totalSteps - 1) {
      this.currentStep++;
      this.render();
    }
  }

  /**
   * 건너뛰기
   */
  skip() {
    console.log('[Onboarding] Skipped');
    this.complete();
  }

  /**
   * 완료 (숨기기만 하고 제거하지 않음 - 재사용 가능하도록)
   */
  complete() {
    console.log('[Onboarding] Completed');
    this.markAsComplete();

    // 페이드아웃 애니메이션 후 숨김
    const overlay = document.getElementById('onboarding-overlay');
    if (overlay) {
      overlay.style.animation = 'fadeIn 0.3s ease-out reverse';
      setTimeout(() => {
        overlay.style.display = 'none';
        if (this.onComplete) this.onComplete();
      }, 300);
    }
  }

  /**
   * 온보딩 다시 보이기 (홈으로 돌아갈 때 사용)
   */
  showHome() {
    console.log('[Onboarding] Showing home screen...');
    const overlay = document.getElementById('onboarding-overlay');
    if (overlay) {
      // 마지막 단계(AR 체험 시작 화면)로 이동
      this.currentStep = this.totalSteps;
      overlay.style.display = 'flex';
      overlay.style.animation = 'fadeIn 0.3s ease-out';
      this.updateUI();
    } else {
      // 온보딩이 없으면 새로 생성
      this.currentStep = this.totalSteps;
      this.render();
    }
  }
}

console.log('[Onboarding] Module loaded');
