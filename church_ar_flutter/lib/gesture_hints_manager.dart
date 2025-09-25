import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:async';
import 'dart:math' as dart_math;
import 'feedback_manager.dart';
import 'liquid_glass_theme.dart';

/// 제스처 힌트 단계를 정의하는 열거형
enum HintStep {
  arButton('온누리교회 로고를 눌러보세요', '', 'ar_button_hint'),
  rotation('드래그하여 회전해보세요', '👆', 'rotation_hint'),
  zoom('핀치하여 크기를 조절해보세요', '🤏', 'zoom_hint'),
  completed('튜토리얼 완료!', '🎉', 'tutorial_completed');

  const HintStep(this.message, this.emoji, this.prefKey);
  final String message;
  final String emoji;
  final String prefKey;
}

/// 제스처 힌트 및 가이드 시스템을 관리하는 클래스
class GestureHintsManager {
  static final GestureHintsManager _instance = GestureHintsManager._internal();
  factory GestureHintsManager() => _instance;
  GestureHintsManager._internal();

  // 상태 관리
  HintStep _currentStep = HintStep.arButton;
  bool _isFirstTime = true;
  bool _isHintVisible = false;
  bool _tutorialSkipped = false;
  Timer? _inactivityTimer;
  Timer? _animationTimer;

  // 콜백
  ValueNotifier<HintStep?> currentHintNotifier = ValueNotifier<HintStep?>(null);
  ValueNotifier<bool> isHintVisibleNotifier = ValueNotifier<bool>(false);

  static const String _firstTimePrefKey = 'is_first_time_user';
  static const Duration _inactivityDelay = Duration(seconds: 3);
  static const Duration _hintDisplayDuration = Duration(seconds: 8);

  /// 힌트 시스템 초기화
  Future<void> initialize() async {
    final prefs = await SharedPreferences.getInstance();
    _isFirstTime = prefs.getBool(_firstTimePrefKey) ?? true;

    if (_isFirstTime) {
      // 첫 사용자는 자동으로 힌트 시작
      _startInactivityTimer();
    } else {
      // 기존 사용자는 진행된 단계 확인
      _loadProgress();
    }
  }

  /// 사용자 진행 상태 로드
  Future<void> _loadProgress() async {
    final prefs = await SharedPreferences.getInstance();

    // 각 단계 완료 여부 확인
    for (final step in HintStep.values) {
      if (step == HintStep.completed) continue;

      final isCompleted = prefs.getBool(step.prefKey) ?? false;
      if (!isCompleted) {
        _currentStep = step;
        return;
      }
    }

    // 모든 단계 완료됨
    _currentStep = HintStep.completed;
  }

  /// 비활성 타이머 시작 (3초간 상호작용 없으면 힌트 표시)
  void _startInactivityTimer() {
    _inactivityTimer?.cancel();

    if (_currentStep == HintStep.completed || _tutorialSkipped) return;

    _inactivityTimer = Timer(_inactivityDelay, () {
      _showHint();
    });
  }

  /// 힌트 표시
  void _showHint() {
    if (_currentStep == HintStep.completed || _tutorialSkipped) return;

    _isHintVisible = true;
    currentHintNotifier.value = _currentStep;
    isHintVisibleNotifier.value = true;

    // 가벼운 햅틱 피드백으로 힌트 등장 알림
    FeedbackManager.lightImpact();

    // 8초 후 힌트 자동 숨김
    _animationTimer?.cancel();
    _animationTimer = Timer(_hintDisplayDuration, () {
      _hideHint();
    });
  }

  /// 힌트 숨김
  void _hideHint() {
    _isHintVisible = false;
    isHintVisibleNotifier.value = false;
    currentHintNotifier.value = null;

    // 다시 비활성 타이머 시작
    _startInactivityTimer();
  }

  /// 사용자 상호작용 감지 시 호출
  void onUserInteraction() {
    _inactivityTimer?.cancel();

    if (_isHintVisible) {
      _hideHint();
    } else {
      _startInactivityTimer();
    }
  }

  /// AR 버튼 터치 완료
  Future<void> onArButtonPressed() async {
    await _completeStep(HintStep.arButton);
    _moveToNextStep();
  }

  /// 회전 제스처 완료
  Future<void> onRotationGesture() async {
    await _completeStep(HintStep.rotation);
    _moveToNextStep();
  }

  /// 확대/축소 제스처 완료
  Future<void> onZoomGesture() async {
    await _completeStep(HintStep.zoom);
    _moveToNextStep();
  }

  /// 단계 완료 처리
  Future<void> _completeStep(HintStep step) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(step.prefKey, true);

    // 첫 사용자 플래그 업데이트
    if (_isFirstTime) {
      await prefs.setBool(_firstTimePrefKey, false);
      _isFirstTime = false;
    }

    // 성공 피드백
    FeedbackManager.successPattern();
  }

  /// 다음 단계로 이동
  void _moveToNextStep() {
    final currentIndex = HintStep.values.indexOf(_currentStep);
    if (currentIndex < HintStep.values.length - 1) {
      _currentStep = HintStep.values[currentIndex + 1];

      if (_currentStep == HintStep.completed) {
        _completeTutorial();
      } else {
        // 다음 힌트는 짧은 지연 후 표시
        Future.delayed(const Duration(seconds: 2), () {
          _showHint();
        });
      }
    }
  }

  /// 튜토리얼 완료
  void _completeTutorial() {
    _animationTimer?.cancel();
    _inactivityTimer?.cancel();
    currentHintNotifier.value = HintStep.completed;
    isHintVisibleNotifier.value = true;

    // 완료 메시지 3초 후 숨김
    Timer(const Duration(seconds: 3), () {
      isHintVisibleNotifier.value = false;
      currentHintNotifier.value = null;
    });
  }

  /// 튜토리얼 건너뛰기
  Future<void> skipTutorial() async {
    _tutorialSkipped = true;
    _animationTimer?.cancel();
    _inactivityTimer?.cancel();
    isHintVisibleNotifier.value = false;
    currentHintNotifier.value = null;

    // 모든 단계를 완료된 것으로 처리
    final prefs = await SharedPreferences.getInstance();
    for (final step in HintStep.values) {
      if (step != HintStep.completed) {
        await prefs.setBool(step.prefKey, true);
      }
    }
    await prefs.setBool(_firstTimePrefKey, false);

    FeedbackManager.mediumImpact();
  }

  /// 튜토리얼 재시작
  Future<void> resetTutorial() async {
    final prefs = await SharedPreferences.getInstance();

    // 모든 진행 상태 초기화
    for (final step in HintStep.values) {
      if (step != HintStep.completed) {
        await prefs.setBool(step.prefKey, false);
      }
    }
    await prefs.setBool(_firstTimePrefKey, true);

    // 상태 초기화
    _currentStep = HintStep.arButton;
    _isFirstTime = true;
    _tutorialSkipped = false;
    isHintVisibleNotifier.value = false;
    currentHintNotifier.value = null;

    // 힌트 시스템 재시작
    _startInactivityTimer();

    FeedbackManager.lightImpact();
  }

  /// 현재 힌트 상태 확인
  bool get isHintVisible => _isHintVisible;
  HintStep get currentStep => _currentStep;
  bool get isFirstTimeUser => _isFirstTime;
  bool get isTutorialCompleted => _currentStep == HintStep.completed;

  /// 리소스 정리
  void dispose() {
    _animationTimer?.cancel();
    _inactivityTimer?.cancel();
    currentHintNotifier.dispose();
    isHintVisibleNotifier.dispose();
  }
}

/// 제스처 힌트 오버레이 위젯
class GestureHintOverlay extends StatefulWidget {
  final Widget child;

  const GestureHintOverlay({
    Key? key,
    required this.child,
  }) : super(key: key);

  @override
  State<GestureHintOverlay> createState() => _GestureHintOverlayState();
}

class _GestureHintOverlayState extends State<GestureHintOverlay>
    with TickerProviderStateMixin {
  late AnimationController _fadeController;
  late AnimationController _pulseController;
  late AnimationController _gestureController;
  late Animation<double> _fadeAnimation;
  late Animation<double> _pulseAnimation;
  late Animation<double> _gestureAnimation;

  final GestureHintsManager _hintsManager = GestureHintsManager();

  @override
  void initState() {
    super.initState();
    _setupAnimations();
    _setupListeners();
  }

  void _setupAnimations() {
    _fadeController = AnimationController(
      duration: const Duration(milliseconds: 500),
      vsync: this,
    );

    _pulseController = AnimationController(
      duration: const Duration(seconds: 2),
      vsync: this,
    )..repeat();

    _gestureController = AnimationController(
      duration: const Duration(seconds: 3),
      vsync: this,
    )..repeat();

    _fadeAnimation = CurvedAnimation(
      parent: _fadeController,
      curve: Curves.easeInOut,
    );

    _pulseAnimation = Tween<double>(
      begin: 0.8,
      end: 1.2,
    ).animate(CurvedAnimation(
      parent: _pulseController,
      curve: Curves.easeInOut,
    ));

    _gestureAnimation = CurvedAnimation(
      parent: _gestureController,
      curve: Curves.easeInOut,
    );
  }

  void _setupListeners() {
    _hintsManager.isHintVisibleNotifier.addListener(() {
      if (_hintsManager.isHintVisibleNotifier.value) {
        _fadeController.forward();
      } else {
        _fadeController.reverse();
      }
    });
  }

  @override
  void dispose() {
    _fadeController.dispose();
    _pulseController.dispose();
    _gestureController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        // 메인 콘텐츠 + 사용자 상호작용 감지
        GestureDetector(
          onTap: () => _hintsManager.onUserInteraction(),
          onScaleStart: (_) => _hintsManager.onUserInteraction(),
          child: widget.child,
        ),

        // 힌트 오버레이
        ValueListenableBuilder<bool>(
          valueListenable: _hintsManager.isHintVisibleNotifier,
          builder: (context, isVisible, child) {
            if (!isVisible) return const SizedBox.shrink();

            return ValueListenableBuilder<HintStep?>(
              valueListenable: _hintsManager.currentHintNotifier,
              builder: (context, currentHint, child) {
                if (currentHint == null) return const SizedBox.shrink();

                return AnimatedBuilder(
                  animation: _fadeAnimation,
                  builder: (context, child) {
                    return Opacity(
                      opacity: _fadeAnimation.value,
                      child: _buildHintForStep(currentHint),
                    );
                  },
                );
              },
            );
          },
        ),
      ],
    );
  }

  Widget _buildHintForStep(HintStep step) {
    switch (step) {
      case HintStep.arButton:
        return _buildArButtonHint();
      case HintStep.rotation:
        return _buildRotationHint();
      case HintStep.zoom:
        return _buildZoomHint();
      case HintStep.completed:
        return _buildCompletionMessage();
    }
  }

  Widget _buildArButtonHint() {
    return Positioned(
      bottom: 120, // AR 버튼 위쪽
      left: 0,
      right: 0,
      child: Center(
        child: _buildHintBubble(
          message: HintStep.arButton.message,
          emoji: HintStep.arButton.emoji,
          showArrow: true,
          arrowDirection: ArrowDirection.down,
        ),
      ),
    );
  }

  Widget _buildRotationHint() {
    return Positioned(
      top: MediaQuery.of(context).size.height * 0.3,
      left: 20,
      right: 20,
      child: Column(
        children: [
          _buildHintBubble(
            message: HintStep.rotation.message,
            emoji: HintStep.rotation.emoji,
          ),
          const SizedBox(height: 20),
          _buildGestureAnimation(GestureType.rotation),
        ],
      ),
    );
  }

  Widget _buildZoomHint() {
    return Positioned(
      top: MediaQuery.of(context).size.height * 0.4,
      left: 20,
      right: 20,
      child: Column(
        children: [
          _buildHintBubble(
            message: HintStep.zoom.message,
            emoji: HintStep.zoom.emoji,
          ),
          const SizedBox(height: 20),
          _buildGestureAnimation(GestureType.pinch),
        ],
      ),
    );
  }

  Widget _buildCompletionMessage() {
    return Center(
      child: AnimatedBuilder(
        animation: _pulseAnimation,
        builder: (context, child) {
          return Transform.scale(
            scale: _pulseAnimation.value,
            child: GlassContainer(
              enableGlow: true,
              padding: const EdgeInsets.all(24),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    HintStep.completed.emoji,
                    style: const TextStyle(fontSize: 48),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    HintStep.completed.message,
                    style: const TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: LiquidGlassTheme.primaryBlue,
                    ),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    '이제 자유롭게 탐험해보세요!',
                    style: TextStyle(
                      fontSize: 14,
                      color: Colors.grey,
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildHintBubble({
    required String message,
    required String emoji,
    bool showArrow = false,
    ArrowDirection arrowDirection = ArrowDirection.up,
    bool showSkipButton = false,
  }) {
    return GlassContainer(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          AnimatedBuilder(
            animation: _pulseAnimation,
            builder: (context, child) {
              return Transform.scale(
                scale: _pulseAnimation.value,
                child: Text(
                  emoji,
                  style: const TextStyle(fontSize: 24),
                ),
              );
            },
          ),
          const SizedBox(width: 12),
          Flexible(
            child: Text(
              message,
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w500,
                color: Colors.black87,
              ),
              textAlign: TextAlign.center,
            ),
          ),
          if (showSkipButton) ...[
            const SizedBox(width: 12),
            GestureDetector(
              onTap: () => _hintsManager.skipTutorial(),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.grey.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Text(
                  '건너뛰기',
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey,
                  ),
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildGestureAnimation(GestureType type) {
    return AnimatedBuilder(
      animation: _gestureAnimation,
      builder: (context, child) {
        return CustomPaint(
          size: const Size(120, 80),
          painter: GestureAnimationPainter(
            type: type,
            progress: _gestureAnimation.value,
          ),
        );
      },
    );
  }
}

enum ArrowDirection { up, down, left, right }
enum GestureType { rotation, pinch }

/// 제스처 애니메이션을 그리는 CustomPainter
class GestureAnimationPainter extends CustomPainter {
  final GestureType type;
  final double progress;

  GestureAnimationPainter({
    required this.type,
    required this.progress,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = LiquidGlassTheme.primaryBlue.withOpacity(0.6)
      ..strokeWidth = 3
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;

    final center = Offset(size.width / 2, size.height / 2);

    switch (type) {
      case GestureType.rotation:
        _drawRotationGesture(canvas, size, center, paint);
        break;
      case GestureType.pinch:
        _drawPinchGesture(canvas, size, center, paint);
        break;
    }
  }

  void _drawRotationGesture(Canvas canvas, Size size, Offset center, Paint paint) {
    // 원형 화살표 그리기
    final radius = size.width * 0.3;
    final sweepAngle = progress * 1.5 * 3.14159; // 270도까지

    canvas.drawArc(
      Rect.fromCircle(center: center, radius: radius),
      -1.5708, // -90도 시작
      sweepAngle,
      false,
      paint,
    );

    // 화살표 머리 그리기
    if (progress > 0.7) {
      final arrowAngle = -1.5708 + sweepAngle;
      final arrowTip = Offset(
        center.dx + radius * cos(arrowAngle),
        center.dy + radius * sin(arrowAngle),
      );

      _drawArrowHead(canvas, arrowTip, arrowAngle + 1.5708, paint);
    }
  }

  void _drawPinchGesture(Canvas canvas, Size size, Offset center, Paint paint) {
    final maxDistance = size.width * 0.2;
    final currentDistance = maxDistance * (1 - (progress - 0.5).abs() * 2);

    // 두 점 그리기 (핀치 제스처)
    final point1 = Offset(center.dx - currentDistance, center.dy);
    final point2 = Offset(center.dx + currentDistance, center.dy);

    canvas.drawCircle(point1, 8, paint..style = PaintingStyle.fill);
    canvas.drawCircle(point2, 8, paint);

    // 연결선 그리기
    paint.style = PaintingStyle.stroke;
    canvas.drawLine(point1, point2, paint);
  }

  void _drawArrowHead(Canvas canvas, Offset tip, double angle, Paint paint) {
    final arrowLength = 12.0;
    final arrowAngle = 0.5;

    final left = Offset(
      tip.dx - arrowLength * cos(angle - arrowAngle),
      tip.dy - arrowLength * sin(angle - arrowAngle),
    );

    final right = Offset(
      tip.dx - arrowLength * cos(angle + arrowAngle),
      tip.dy - arrowLength * sin(angle + arrowAngle),
    );

    canvas.drawLine(tip, left, paint);
    canvas.drawLine(tip, right, paint);
  }

  @override
  bool shouldRepaint(GestureAnimationPainter oldDelegate) {
    return oldDelegate.progress != progress || oldDelegate.type != type;
  }
}

// 유틸리티 함수들
double cos(double radians) => dart_math.cos(radians);
double sin(double radians) => dart_math.sin(radians);