class ModelData {
  final String id;
  final String name;
  final String description;
  final String src;
  final String thumbnail;
  final String category;

  const ModelData({
    required this.id,
    required this.name,
    required this.description,
    required this.src,
    required this.thumbnail,
    this.category = 'default',
  });

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is ModelData && runtimeType == other.runtimeType && id == other.id;

  @override
  int get hashCode => id.hashCode;
}

class ModelRepository {
  static const List<ModelData> models = [
    ModelData(
      id: 'church-01',
      name: '온누리교회 1',
      description: '교회 건물 3D 모델-01',
      src: 'assets/models/church-model-01.glb',
      thumbnail: 'assets/thumbnails/church-01.jpg',
      category: 'buildings',
    ),
    ModelData(
      id: 'church-02',
      name: '온누리교회 2',
      description: '교회 건물 3D 모델-02',
      src: 'assets/models/church-model-02.glb',
      thumbnail: 'assets/thumbnails/church-02.jpg',
      category: 'buildings',
    ),
    ModelData(
      id: 'church-03',
      name: '온누리교회 3',
      description: '교회 건물 3D 모델-03',
      src: 'assets/models/church-model-03.glb',
      thumbnail: 'assets/thumbnails/church-03.jpg',
      category: 'buildings',
    ),
    ModelData(
      id: 'church-04',
      name: '온누리교회 4',
      description: '교회 건물 3D 모델-04',
      src: 'assets/models/church-model-04.glb',
      thumbnail: 'assets/thumbnails/church-04.jpg',
      category: 'buildings',
    ),
    ModelData(
      id: 'church-05',
      name: '온누리교회 5',
      description: '교회 건물 3D 모델-05',
      src: 'assets/models/church-model-05.glb',
      thumbnail: 'assets/thumbnails/church-05.jpg',
      category: 'buildings',
    ),
  ];

  static ModelData? getById(String id) {
    try {
      return models.firstWhere((model) => model.id == id);
    } catch (e) {
      return null;
    }
  }

  static List<ModelData> getByCategory(String category) {
    return models.where((model) => model.category == category).toList();
  }

  static ModelData get defaultModel => models.first;
}
