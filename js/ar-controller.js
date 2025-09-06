/**
 * Onnuri Church 40th Anniversary AR Project
 * AR Controller - Main Logic Management
 */

class ARController {
    constructor() {
        this.isMarkerVisible = false;
        this.churchObject = null;
        this.infoText = null;
        
        this.init();
    }

    /**
     * Initialize AR Controller
     */
    init() {
        console.log('AR Controller initializing...');
        
        // Wait for A-Frame to load
        if (typeof AFRAME === 'undefined') {
            setTimeout(() => this.init(), 100);
            return;
        }
        
        // Setup event listeners when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupEventListeners());
        } else {
            this.setupEventListeners();
        }

        // Setup 3D scene elements when A-Frame scene is loaded
        this.setupScene();
    }

    /**
     * Setup church data
     */
    setupChurchData() {
        this.churchData = {
            title: "온누리교회 40주년",
            description: "1984년 설립되어 40년간 성장해온 온누리교회의 역사를 AR로 체험해보세요.",
            color: "#8B4513",
            scale: "1 1 1"
        };

        console.log('Church data loaded');
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Setup church data
        this.setupChurchData();

        console.log('Event listeners setup complete');
    }

    /**
     * Setup A-Frame scene
     */
    setupScene() {
        // Wait for A-Frame scene to be ready
        const scene = document.querySelector('a-scene');
        if (!scene) {
            setTimeout(() => this.setupScene(), 100);
            return;
        }

        // Get 3D object references when scene is loaded
        scene.addEventListener('loaded', () => {
            this.churchObject = document.getElementById('church-object');
            this.infoText = document.getElementById('info-text');
            
            if (this.churchObject && this.infoText) {
                console.log('3D object references complete');
                this.initializeChurchModel();
            }
        });

        // Setup marker events
        const marker = document.getElementById('main-marker');
        if (marker) {
            marker.addEventListener('markerFound', () => {
                this.onMarkerFound();
            });

            marker.addEventListener('markerLost', () => {
                this.onMarkerLost();
            });
        }
    }

    /**
     * When marker is found
     */
    onMarkerFound() {
        console.log('Marker found!');
        this.isMarkerVisible = true;
        
        // Show info panel
        const infoPanel = document.getElementById('info-panel');
        if (infoPanel) {
            infoPanel.style.display = 'block';
        }
    }

    /**
     * When marker is lost
     */
    onMarkerLost() {
        console.log('Marker lost');
        this.isMarkerVisible = false;
        
        // Hide info panel
        const infoPanel = document.getElementById('info-panel');
        if (infoPanel) {
            infoPanel.style.display = 'none';
        }
    }

    /**
     * Initialize church 3D model
     */
    initializeChurchModel() {
        if (!this.churchObject || !this.infoText || !this.churchData) return;

        // Set initial 3D object properties
        this.churchObject.setAttribute('material', `color: ${this.churchData.color}; roughness: 0.8`);
        this.churchObject.setAttribute('scale', this.churchData.scale);
        
        // Set info text
        this.infoText.setAttribute('value', `${this.churchData.title}\n1984-2024`);

        console.log('Church 3D model initialized');
    }

    /**
     * Load external church data (future implementation)
     */
    async loadChurchDataFromJSON() {
        try {
            const response = await fetch('data/church.json');
            if (response.ok) {
                const data = await response.json();
                if (data.church) {
                    this.churchData = data.church;
                    this.initializeChurchModel();
                    console.log('External church data loaded successfully');
                }
            }
        } catch (error) {
            console.log('External church data load failed, using default data:', error.message);
        }
    }

    /**
     * Screenshot capture function
     */
    captureScreenshot() {
        try {
            const scene = document.querySelector('a-scene');
            if (scene && scene.canvas) {
                const canvas = scene.canvas;
                const dataURL = canvas.toDataURL('image/png');
                
                // Create download link
                const link = document.createElement('a');
                link.download = `Onnuri_Church_AR_${new Date().getTime()}.png`;
                link.href = dataURL;
                link.click();
                
                console.log('Screenshot saved successfully');
                
                // Show success feedback
                this.showCaptureSuccess();
            }
        } catch (error) {
            console.error('Screenshot capture failed:', error);
            alert('스크린샷 기능에 문제가 발생했습니다.');
        }
    }

    /**
     * Show capture success feedback
     */
    showCaptureSuccess() {
        const captureBtn = document.getElementById('capture-btn');
        const originalContent = captureBtn.innerHTML;
        
        // Temporarily change button content
        captureBtn.innerHTML = '<span>✅</span>';
        captureBtn.style.background = '#34C759';
        
        // Reset after 1 second
        setTimeout(() => {
            captureBtn.innerHTML = originalContent;
            captureBtn.style.background = '';
        }, 1000);
    }
}

// Create AR controller instance
let arController;

// Initialize AR controller when page loads
document.addEventListener('DOMContentLoaded', function() {
    arController = new ARController();
    
    // Screenshot button event
    const captureBtn = document.getElementById('capture-btn');
    if (captureBtn) {
        captureBtn.addEventListener('click', function() {
            if (arController && arController.isMarkerVisible) {
                arController.captureScreenshot();
            } else {
                alert('마커를 인식한 후 사진을 촬영할 수 있습니다.');
            }
        });
    }
});

// Make globally accessible
window.arController = arController;