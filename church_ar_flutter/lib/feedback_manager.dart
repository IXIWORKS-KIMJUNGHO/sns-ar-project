import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

/// 앱 전체의 피드백 시스템을 관리하는 중앙 관리자
class FeedbackManager {
  static final FeedbackManager _instance = FeedbackManager._internal();
  factory FeedbackManager() => _instance;
  FeedbackManager._internal();

  // 피드백 강도 설정
  static const Duration _lightImpactDuration = Duration(milliseconds: 50);
  static const Duration _mediumImpactDuration = Duration(milliseconds: 100);
  static const Duration _heavyImpactDuration = Duration(milliseconds: 150);

  /// 가벼운 햅틱 피드백 (UI 버튼 터치)
  static Future<void> lightImpact() async {
    try {
      await HapticFeedback.lightImpact();
    } catch (e) {
      debugPrint('햅틱 피드백 오류: $e');
    }
  }

  /// 중간 강도 햅틱 피드백 (AR 버튼, 중요한 액션)
  static Future<void> mediumImpact() async {
    try {
      await HapticFeedback.mediumImpact();
    } catch (e) {
      debugPrint('햅틱 피드백 오류: $e');
    }
  }

  /// 강한 햅틱 피드백 (성공, 실패, 경고)
  static Future<void> heavyImpact() async {
    try {
      await HapticFeedback.heavyImpact();
    } catch (e) {
      debugPrint('햅틱 피드백 오류: $e');
    }
  }

  /// 선택 피드백 (토글, 선택 변경)
  static Future<void> selectionClick() async {
    try {
      await HapticFeedback.selectionClick();
    } catch (e) {
      debugPrint('햅틱 피드백 오류: $e');
    }
  }

  /// 진동 패턴 피드백 (성공 시 2번, 실패 시 3번)
  static Future<void> successPattern() async {
    await mediumImpact();
    await Future.delayed(const Duration(milliseconds: 100));
    await lightImpact();
  }

  /// 에러 패턴 피드백
  static Future<void> errorPattern() async {
    await heavyImpact();
    await Future.delayed(const Duration(milliseconds: 150));
    await mediumImpact();
    await Future.delayed(const Duration(milliseconds: 100));
    await lightImpact();
  }

  /// AR 세션 관련 피드백
  static Future<void> arSessionStart() async {
    await heavyImpact();
    await Future.delayed(const Duration(milliseconds: 200));
    await mediumImpact();
  }

  static Future<void> arSessionEnd() async {
    await lightImpact();
    await Future.delayed(const Duration(milliseconds: 100));
    await lightImpact();
  }

  /// 3D 모델 터치 피드백
  static Future<void> modelTouch() async {
    await lightImpact();
  }

  /// 스케일/회전 제스처 피드백
  static Future<void> gestureStart() async {
    await selectionClick();
  }

  static Future<void> gestureEnd() async {
    await lightImpact();
  }
}

/// 시각적 피드백 효과를 위한 위젯
class VisualFeedbackOverlay extends StatefulWidget {
  final Widget child;
  final bool isEnabled;

  const VisualFeedbackOverlay({
    Key? key,
    required this.child,
    this.isEnabled = true,
  }) : super(key: key);

  @override
  State<VisualFeedbackOverlay> createState() => _VisualFeedbackOverlayState();
}

class _VisualFeedbackOverlayState extends State<VisualFeedbackOverlay>
    with TickerProviderStateMixin {
  List<TouchRipple> _ripples = [];
  late AnimationController _cleanupController;

  @override
  void initState() {
    super.initState();
    _cleanupController = AnimationController(
      duration: const Duration(seconds: 1),
      vsync: this,
    );
  }

  @override
  void dispose() {
    _cleanupController.dispose();
    super.dispose();
  }

  void _addRipple(Offset position) {
    if (!widget.isEnabled) return;

    final ripple = TouchRipple(
      position: position,
      vsync: this,
    );

    setState(() {
      _ripples.add(ripple);
    });

    // 3초 후 리플 제거
    Future.delayed(const Duration(seconds: 3), () {
      if (mounted) {
        setState(() {
          _ripples.remove(ripple);
        });
        ripple.dispose();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: (details) {
        _addRipple(details.globalPosition);
        FeedbackManager.lightImpact();
      },
      child: Stack(
        children: [
          widget.child,
          // 터치 리플 효과들
          ..._ripples.map((ripple) => ripple.build(context)),
        ],
      ),
    );
  }
}

/// 개별 터치 리플 효과
class TouchRipple {
  final Offset position;
  late final AnimationController controller;
  late final Animation<double> scaleAnimation;
  late final Animation<double> opacityAnimation;

  TouchRipple({
    required this.position,
    required TickerProvider vsync,
  }) {
    controller = AnimationController(
      duration: const Duration(milliseconds: 600),
      vsync: vsync,
    );

    scaleAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: controller,
      curve: Curves.easeOut,
    ));

    opacityAnimation = Tween<double>(
      begin: 0.8,
      end: 0.0,
    ).animate(CurvedAnimation(
      parent: controller,
      curve: const Interval(0.2, 1.0, curve: Curves.easeOut),
    ));

    controller.forward();
  }

  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: controller,
      builder: (context, child) {
        return Positioned(
          left: position.dx - 25,
          top: position.dy - 25,
          child: IgnorePointer(
            child: Container(
              width: 50,
              height: 50,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: Colors.white.withOpacity(opacityAnimation.value * 0.6),
                border: Border.all(
                  color: Colors.blue.withOpacity(opacityAnimation.value),
                  width: 2,
                ),
              ),
              transform: Matrix4.identity()..scale(scaleAnimation.value),
            ),
          ),
        );
      },
    );
  }

  void dispose() {
    controller.dispose();
  }
}

/// 버튼 터치 시 스케일 애니메이션을 적용하는 위젯
class FeedbackButton extends StatefulWidget {
  final Widget child;
  final VoidCallback? onPressed;
  final bool enableHaptic;
  final bool enableScale;

  const FeedbackButton({
    Key? key,
    required this.child,
    this.onPressed,
    this.enableHaptic = true,
    this.enableScale = true,
  }) : super(key: key);

  @override
  State<FeedbackButton> createState() => _FeedbackButtonState();
}

class _FeedbackButtonState extends State<FeedbackButton>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 150),
      vsync: this,
    );
    _scaleAnimation = Tween<double>(
      begin: 1.0,
      end: 0.95,
    ).animate(CurvedAnimation(
      parent: _controller,
      curve: Curves.easeInOut,
    ));
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: (_) {
        if (widget.enableScale) _controller.forward();
        if (widget.enableHaptic) FeedbackManager.lightImpact();
      },
      onTapUp: (_) {
        if (widget.enableScale) _controller.reverse();
        widget.onPressed?.call();
      },
      onTapCancel: () {
        if (widget.enableScale) _controller.reverse();
      },
      child: widget.enableScale
          ? AnimatedBuilder(
              animation: _scaleAnimation,
              builder: (context, child) => Transform.scale(
                scale: _scaleAnimation.value,
                child: widget.child,
              ),
            )
          : widget.child,
    );
  }
}