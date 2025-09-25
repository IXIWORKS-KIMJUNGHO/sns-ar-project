import 'package:flutter/material.dart';

class PhotoCaptureWidget extends StatefulWidget {
  const PhotoCaptureWidget({super.key});

  @override
  State<PhotoCaptureWidget> createState() => _PhotoCaptureWidgetState();
}

class _PhotoCaptureWidgetState extends State<PhotoCaptureWidget> 
    with SingleTickerProviderStateMixin {
  bool isPhotoMode = false;
  int countdown = 0;
  late AnimationController _animationController;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 300),
      vsync: this,
    );
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }



  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        
        // 카운트다운 오버레이
        if (isPhotoMode && countdown > 0)
          Container(
            color: Colors.black.withAlpha(77),
            child: Center(
              child: AnimatedSwitcher(
                duration: const Duration(milliseconds: 300),
                child: Text(
                  countdown.toString(),
                  key: ValueKey(countdown),
                  style: const TextStyle(
                    fontSize: 120,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
              ),
            ),
          ),
        
        // 카메라 플래시 효과
        if (isPhotoMode && countdown == 0)
          AnimatedOpacity(
            duration: const Duration(milliseconds: 200),
            opacity: countdown == 0 ? 1.0 : 0.0,
            child: Container(
              color: Colors.white,
            ),
            onEnd: () {
              if (mounted) {
                setState(() {
                  // 플래시 효과 종료
                });
              }
            },
          ),
      ],
    );
  }
}