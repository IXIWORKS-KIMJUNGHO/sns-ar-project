import 'package:flutter/material.dart';
import 'dart:ui';
import 'liquid_glass_theme.dart';
import 'feedback_manager.dart';

class ARControlsWidget extends StatefulWidget {
  final GlobalKey modelViewerKey;
  final bool isArMode;
  final bool isPlacementMode;
  final bool isPlaneDetected;
  final VoidCallback? onARButtonPressed;
  final VoidCallback? onPlacementButtonPressed;

  const ARControlsWidget({
    super.key,
    required this.modelViewerKey,
    this.isArMode = false,
    this.isPlacementMode = false,
    this.isPlaneDetected = false,
    this.onARButtonPressed,
    this.onPlacementButtonPressed,
  });

  @override
  State<ARControlsWidget> createState() => _ARControlsWidgetState();
}

class _ARControlsWidgetState extends State<ARControlsWidget>
    with TickerProviderStateMixin {
  late AnimationController _pulseController;
  late Animation<double> _pulseAnimation;
  late AnimationController _fadeController;
  late Animation<double> _fadeAnimation;

  @override
  void initState() {
    super.initState();

    // 펄스 애니메이션 (AR 버튼용)
    _pulseController = AnimationController(
      duration: const Duration(seconds: 2),
      vsync: this,
    )..repeat(reverse: true);

    _pulseAnimation = Tween<double>(
      begin: 1.0,
      end: 1.1,
    ).animate(CurvedAnimation(
      parent: _pulseController,
      curve: Curves.easeInOut,
    ));

    // 페이드 애니메이션 (배치 버튼용)
    _fadeController = AnimationController(
      duration: const Duration(milliseconds: 300),
      vsync: this,
    );

    _fadeAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _fadeController,
      curve: Curves.easeInOut,
    ));
  }

  @override
  void didUpdateWidget(ARControlsWidget oldWidget) {
    super.didUpdateWidget(oldWidget);

    // 배치 모드 상태 변경 시 애니메이션 제어
    if (widget.isPlacementMode && !oldWidget.isPlacementMode) {
      _fadeController.forward();
    } else if (!widget.isPlacementMode && oldWidget.isPlacementMode) {
      _fadeController.reverse();
    }

    // 평면 감지 상태 로깅
    if (widget.isPlaneDetected != oldWidget.isPlaneDetected) {
      debugPrint('🔍 평면 감지 상태 변경: ${widget.isPlaneDetected ? "감지됨" : "미감지"}');
    }
  }

  @override
  void dispose() {
    _pulseController.dispose();
    _fadeController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        // 배치 버튼 (AR 모드에서만 표시, 위쪽)
        if (widget.isPlacementMode)
          FadeTransition(
            opacity: _fadeAnimation,
            child: Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: widget.isPlaneDetected
                ? FeedbackButton(
                    enableHaptic: true,
                    enableScale: true,
                    onPressed: () {
                      FeedbackManager.successPattern();
                      widget.onPlacementButtonPressed?.call();
                      _sendPlacementMessage();
                    },
                    child: _buildPlacementButton(),
                  )
                : _buildDetectionWaitingIndicator(),
            ),
          ),

        // AR 버튼 (항상 표시, 아래쪽) - 프리미엄 애니메이션
        AnimatedBuilder(
          animation: _pulseAnimation,
          builder: (context, child) {
            return Transform.scale(
              scale: _pulseAnimation.value,
              child: Container(
                // 외부 글로우 오라
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(100),
                  boxShadow: [
                    // 동적 신성한 오라
                    BoxShadow(
                      color: LiquidGlassTheme.primaryBlue.withValues(
                        alpha: 0.3 * _pulseAnimation.value,
                      ),
                      blurRadius: 30 * _pulseAnimation.value,
                      offset: const Offset(0, 0),
                      spreadRadius: -2,
                    ),
                    // 부드러운 라벤더 리플 효과
                    BoxShadow(
                      color: const Color(0xFFE6E6FA).withValues(
                        alpha: 0.15 * _pulseAnimation.value,
                      ),
                      blurRadius: 35 * _pulseAnimation.value,
                      offset: const Offset(0, 0),
                      spreadRadius: -2,
                    ),
                  ],
                ),
                child: FeedbackButton(
                  enableHaptic: true,
                  enableScale: true,
                  onPressed: () {
                    FeedbackManager.mediumImpact();
                    widget.onARButtonPressed?.call();
                    _sendArButtonMessage();
                  },
                  child: _buildARButton(),
                ),
              ),
            );
          },
        ),
      ],
    );
  }

  Widget _buildARButton() {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        // 원형 AR 버튼
        Container(
          width: 90,
          height: 90,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            // 프리미엄 3-stop 그라디언트
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [
                Colors.white.withValues(alpha: 0.25), // 더 밝은 시작
                Colors.white.withValues(alpha: 0.18), // 중간 투명도
                Colors.white.withValues(alpha: 0.22), // 약간 더 밝은 끝
              ],
              stops: const [0.0, 0.5, 1.0],
            ),
            border: Border.all(
              width: 1.5,
              color: Colors.white.withValues(alpha: 0.35),
            ),
            boxShadow: [
              // 메인 그림자 (더 깊이 있게)
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.15),
                blurRadius: 40,
                offset: const Offset(0, 16),
                spreadRadius: -8,
              ),
              // 신성한 파란 글로우
              BoxShadow(
                color: LiquidGlassTheme.primaryBlue.withValues(alpha: 0.6),
                blurRadius: 20,
                offset: const Offset(0, 8),
                spreadRadius: -4,
              ),
              // 내치럼 보라 글로우 (신성한 빛)
              BoxShadow(
                color: LiquidGlassTheme.secondaryPurple.withValues(alpha: 0.4),
                blurRadius: 32,
                offset: const Offset(0, 0),
                spreadRadius: -8,
              ),
              // 상단 하이라이트 (더 강하게)
              BoxShadow(
                color: Colors.white.withValues(alpha: 0.9),
                blurRadius: 1,
                offset: const Offset(0, 1),
                blurStyle: BlurStyle.inner,
              ),
              // 부드러운 라벤더 오라 (평화로운 느낌)
              BoxShadow(
                color: const Color(0xFFE6E6FA).withValues(alpha: 0.25),
                blurRadius: 16,
                offset: const Offset(0, 4),
                spreadRadius: -6,
              ),
            ],
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(45), // 90x90에 맞게 조정
            child: BackdropFilter(
              filter: ImageFilter.blur(sigmaX: 25, sigmaY: 25), // 더 강한 블러
              child: Image.asset(
                'assets/images/onnuri_logo.png',
                width: 40,
                height: 40,
                fit: BoxFit.contain,
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildPlacementButton() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
      decoration: BoxDecoration(
        // 배치 버튼은 좀 더 투명하게
        color: Colors.white.withValues(alpha: 0.2),
        borderRadius: BorderRadius.circular(100),
        border: Border.all(
          color: Colors.white.withValues(alpha: 0.3),
          width: 1.5,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.1),
            blurRadius: 24,
            offset: const Offset(0, 6),
          ),
          BoxShadow(
            color: LiquidGlassTheme.primaryBlue.withValues(alpha: 0.2),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(100),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                '📍',
                style: const TextStyle(fontSize: 14),
              ),
              const SizedBox(width: 6),
              Text(
                '배치하기',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: LiquidGlassTheme.primaryBlue,
                  letterSpacing: -0.3,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDetectionWaitingIndicator() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
      decoration: BoxDecoration(
        // 비활성화된 상태는 더 투명하게
        color: Colors.white.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(100),
        border: Border.all(
          color: Colors.white.withValues(alpha: 0.2),
          width: 1.5,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 16,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(100),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              // 회전하는 로딩 인디케이터
              SizedBox(
                width: 14,
                height: 14,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  valueColor: AlwaysStoppedAnimation<Color>(
                    Colors.white.withValues(alpha: 0.6),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Text(
                '평면 감지 중...',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                  color: Colors.white.withValues(alpha: 0.7),
                  letterSpacing: -0.3,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _sendArButtonMessage() {
    // Model Viewer iframe에 AR 시작 메시지 전송
    final modelViewerState = widget.modelViewerKey.currentState;
    if (modelViewerState != null) {
      // ModelViewer의 sendMessage 메서드를 통해 iframe에 메시지 전송
      debugPrint('🚀 AR 버튼 클릭 - iframe에 startAR 메시지 전송');
      // 실제 메시지 전송은 model_viewer_widget_web.dart에서 처리
    }
  }

  void _sendPlacementMessage() {
    // Model Viewer iframe에 배치 메시지 전송
    final modelViewerState = widget.modelViewerKey.currentState;
    if (modelViewerState != null) {
      debugPrint('📍 배치 버튼 클릭 - iframe에 placeModel 메시지 전송');
      // 실제 메시지 전송은 model_viewer_widget_web.dart에서 처리
    }
  }
}

