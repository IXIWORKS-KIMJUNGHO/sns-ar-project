import 'package:flutter/material.dart';
import 'dart:ui';

class LiquidGlassTheme {
  // 온누리교회 브랜드 색상
  static const Color primaryBlue = Color(0xFF003C7A); // HSB(213,100,48) - 온누리교회 메인 컬러
  static const Color secondaryPurple = Color(0xFF2E5BBA); // 보완 색상 (더 밝은 블루)
  static const Color accentGold = Color(0xFFD4AF37); // 교회다운 황금색 액센트
  static const Color backgroundWhite = Color(0xFFF2F2F7);
  
  // 글래스모피즘 효과
  static BoxDecoration glassDecoration = BoxDecoration(
    color: Colors.white.withAlpha(179), // 70% 투명도
    borderRadius: BorderRadius.circular(20),
    border: Border.all(
      color: Colors.white.withAlpha(51), // 20% 투명도
      width: 1,
    ),
    boxShadow: [
      BoxShadow(
        color: Colors.black.withAlpha(10),
        blurRadius: 30,
        offset: const Offset(0, 10),
      ),
    ],
  );
  
  // 네온 글로우 효과
  static List<BoxShadow> neonGlow = [
    BoxShadow(
      color: primaryBlue.withAlpha(102), // 40% 투명도
      blurRadius: 40,
      spreadRadius: -5,
    ),
    BoxShadow(
      color: secondaryPurple.withAlpha(51), // 20% 투명도
      blurRadius: 60,
      spreadRadius: -10,
    ),
  ];
  
  // 그라디언트 오버레이
  static LinearGradient iridiscentGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [
      primaryBlue.withAlpha(26),  // 10% 투명도
      secondaryPurple.withAlpha(26),
      accentGold.withAlpha(13),   // 5% 투명도
    ],
    stops: const [0.0, 0.5, 1.0],
  );
}

// 글래스 컨테이너 위젯
class GlassContainer extends StatelessWidget {
  final Widget child;
  final double? width;
  final double? height;
  final EdgeInsets? padding;
  final EdgeInsets? margin;
  final bool enableGlow;
  
  const GlassContainer({
    Key? key,
    required this.child,
    this.width,
    this.height,
    this.padding,
    this.margin,
    this.enableGlow = false,
  }) : super(key: key);
  
  @override
  Widget build(BuildContext context) {
    return Container(
      width: width,
      height: height,
      margin: margin,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(20),
        boxShadow: enableGlow ? LiquidGlassTheme.neonGlow : null,
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(20),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
          child: Container(
            padding: padding,
            decoration: LiquidGlassTheme.glassDecoration.copyWith(
              gradient: LiquidGlassTheme.iridiscentGradient,
            ),
            child: child,
          ),
        ),
      ),
    );
  }
}

// 글래스 버튼 위젯 (시각적 스타일링만, 피드백은 FeedbackButton에서 처리)
class GlassButton extends StatelessWidget {
  final String label;
  final IconData? icon;
  final VoidCallback onPressed;
  final bool isPrimary;

  const GlassButton({
    Key? key,
    required this.label,
    this.icon,
    required this.onPressed,
    this.isPrimary = false,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onPressed,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
        decoration: BoxDecoration(
          color: isPrimary
            ? LiquidGlassTheme.primaryBlue.withAlpha(204) // 80% 투명도
            : Colors.white.withAlpha(179), // 70% 투명도
          borderRadius: BorderRadius.circular(100),
          border: Border.all(
            color: Colors.white.withAlpha(77), // 30% 투명도
            width: 1,
          ),
          boxShadow: [
            if (isPrimary)
              BoxShadow(
                color: LiquidGlassTheme.primaryBlue.withAlpha(102),
                blurRadius: 20,
                offset: const Offset(0, 5),
              ),
            BoxShadow(
              color: Colors.black.withAlpha(13),
              blurRadius: 10,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (icon != null) ...[
              Icon(
                icon,
                size: 20,
                color: isPrimary ? Colors.white : LiquidGlassTheme.primaryBlue,
              ),
              const SizedBox(width: 8),
            ],
            Text(
              label,
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: isPrimary ? Colors.white : LiquidGlassTheme.primaryBlue,
                letterSpacing: -0.5,
              ),
            ),
          ],
        ),
      ),
    );
  }
}