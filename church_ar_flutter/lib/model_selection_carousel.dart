import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:ui';
import 'model_data.dart';
import 'liquid_glass_theme.dart';
import 'feedback_manager.dart';

class ModelSelectionCarousel extends StatefulWidget {
  final Function(ModelData) onModelSelected;
  final double? containerWidth;

  const ModelSelectionCarousel({
    super.key,
    required this.onModelSelected,
    this.containerWidth,
  });

  @override
  State<ModelSelectionCarousel> createState() => _ModelSelectionCarouselState();
}

class _ModelSelectionCarouselState extends State<ModelSelectionCarousel>
    with TickerProviderStateMixin {
  late AnimationController _fadeController;
  late Animation<double> _fadeAnimation;

  int _currentIndex = 0;
  ModelData _selectedModel = ModelRepository.defaultModel;

  @override
  void initState() {
    super.initState();

    // 페이드 애니메이션 설정
    _fadeController = AnimationController(
      duration: const Duration(milliseconds: 300),
      vsync: this,
    );
    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _fadeController, curve: Curves.easeInOut),
    );

    _loadLastSelectedModel();
    _fadeController.forward();
  }

  @override
  void dispose() {
    _fadeController.dispose();
    super.dispose();
  }

  Future<void> _loadLastSelectedModel() async {
    final prefs = await SharedPreferences.getInstance();
    final lastModelId = prefs.getString('last_selected_model');

    if (lastModelId != null) {
      final model = ModelRepository.getById(lastModelId);
      if (model != null) {
        final index = ModelRepository.models.indexOf(model);
        setState(() {
          _currentIndex = index;
          _selectedModel = model;
        });

        widget.onModelSelected(model);
      }
    }
  }

  Future<void> _saveSelectedModel(ModelData model) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('last_selected_model', model.id);
  }

  void _navigateToModel(int direction) {
    int newIndex = _currentIndex + direction;
    debugPrint(
      '🔄 _navigateToModel 호출됨: direction=$direction, currentIndex=$_currentIndex, rawNewIndex=$newIndex',
    );

    // 순환 네비게이션 구현
    if (newIndex < 0) {
      newIndex = ModelRepository.models.length - 1; // 마지막으로 이동
    } else if (newIndex >= ModelRepository.models.length) {
      newIndex = 0; // 첫 번째로 이동
    }

    final newModel = ModelRepository.models[newIndex];
    debugPrint(
      '✅ 순환 모델 변경: ${_selectedModel.name} → ${newModel.name} (index: $_currentIndex → $newIndex)',
    );

    setState(() {
      _currentIndex = newIndex;
      _selectedModel = newModel;
    });

    FeedbackManager.mediumImpact();
    _saveSelectedModel(_selectedModel);
    widget.onModelSelected(_selectedModel);

    debugPrint('📤 onModelSelected 호출됨: ${_selectedModel.name}');
  }

  @override
  Widget build(BuildContext context) {
    debugPrint(
      '🔄 ModelSelectionCarousel build: currentIndex=$_currentIndex, totalModels=${ModelRepository.models.length}',
    );
    debugPrint(
      '🔍 좌측 화살표 활성화: ${_currentIndex > 0}, 우측 화살표 활성화: ${_currentIndex < ModelRepository.models.length - 1}',
    );

    return Positioned(
      top: 0,
      left: 0,
      right: 0,
      child: AnimatedBuilder(
        animation: _fadeAnimation,
        builder: (context, child) {
          return Opacity(
            opacity: _fadeAnimation.value,
            child: SizedBox(
              height: 140, // 오버플로우 해결을 위해 높이 증가
              child: Stack(
                children: [
                  // 중앙 모델명 표시 - 중앙 컨테이너와 너비 맞춤
                  Center(
                    child: Container(
                      width: widget.containerWidth ?? double.infinity,
                      margin: const EdgeInsets.only(top: 5),
                      child: _buildModelNameDisplay(),
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

  Widget _buildModelNameDisplay() {
    return Container(
      padding: const EdgeInsets.symmetric(
        vertical: 0, // 상하 패딩 감소
        horizontal: 0, // 좌우 패딩 증가 (중앙 컨테이너와 맞춤)
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(20),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 25, sigmaY: 25),
          child: Container(
            padding: const EdgeInsets.symmetric(
              vertical: 18,
              horizontal: 26,
            ), // 내부 패딩 증가
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  Colors.white.withAlpha(220), // 더 불투명하게
                  Colors.white.withAlpha(180),
                  Colors.white.withAlpha(200),
                ],
                stops: const [0.0, 0.5, 1.0],
              ),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(
                width: 1.5,
                color: Colors.white.withAlpha(200),
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withAlpha(12),
                  blurRadius: 28,
                  offset: const Offset(0, 8),
                  spreadRadius: -2,
                ),
                BoxShadow(
                  color: LiquidGlassTheme.primaryBlue.withAlpha(50),
                  blurRadius: 20,
                  offset: const Offset(0, 3),
                  spreadRadius: -6,
                ),
              ],
            ),
            child: Stack(
              children: [
                // 중앙 컨텐츠 - Center로 감싸서 Stack 내에서 중앙 배치
                Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      // 첫 줄: 타이틀과 인디케이터
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Flexible(
                            child: Text(
                              _selectedModel.name,
                              style: const TextStyle(
                                fontSize: 20, // 타이틀 크기 증가
                                fontWeight: FontWeight.w700, // 더 진하게
                                color: Colors.black87,
                                letterSpacing: -0.4,
                              ),
                              textAlign: TextAlign.center,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Text(
                            '${_currentIndex + 1}/${ModelRepository.models.length}',
                            style: TextStyle(
                              fontSize: 13,
                              color: LiquidGlassTheme.primaryBlue.withAlpha(200),
                              letterSpacing: -0.2,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 6), // 줄 간격
                      // 두 번째 줄: 설명
                      Text(
                        _selectedModel.description,
                        style: TextStyle(
                          fontSize: 12, // 설명 크기 감소
                          fontWeight: FontWeight.w300, // 얇은 폰트
                          color: Colors.black45, // 더 연한 색상
                          letterSpacing: -0.2,
                        ),
                        textAlign: TextAlign.center,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),

                // 좌측 화살표 - 컨테이너 내부
                Positioned(
                  left: 8,
                  top: 0,
                  bottom: 0,
                  child: Center(
                    child: _buildCompactArrowButton(
                      icon: Icons.chevron_left,
                      onPressed: () => _navigateToModel(-1),
                    ),
                  ),
                ),

                // 우측 화살표 - 컨테이너 내부
                Positioned(
                  right: 8,
                  top: 0,
                  bottom: 0,
                  child: Center(
                    child: _buildCompactArrowButton(
                      icon: Icons.chevron_right,
                      onPressed: () => _navigateToModel(1),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildCompactArrowButton({
    required IconData icon,
    required VoidCallback onPressed,
  }) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: () {
          debugPrint(
            '🖱️ 컴팩트 화살표 버튼 클릭됨: ${icon == Icons.chevron_left ? "LEFT" : "RIGHT"}',
          );
          FeedbackManager.lightImpact();
          onPressed();
        },
        borderRadius: BorderRadius.circular(12),
        child: Container(
          width: 24,
          height: 24,
          decoration: BoxDecoration(
            color: Colors.white.withAlpha(180),
            shape: BoxShape.circle,
            border: Border.all(
              color: LiquidGlassTheme.primaryBlue.withAlpha(100),
              width: 0.8,
            ),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withAlpha(8),
                blurRadius: 6,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Icon(
            icon,
            size: 16,
            color: LiquidGlassTheme.primaryBlue.withAlpha(200),
          ),
        ),
      ),
    );
  }
}
