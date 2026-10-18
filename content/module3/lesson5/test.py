import io, sys, runpy, re, os

def test_best_model_saved():
    captured = io.StringIO()
    old = sys.stdout
    sys.stdout = captured
    try:
        runpy.run_path('/workspace/solution.py')
    finally:
        sys.stdout = old
    out = captured.getvalue()

    # Все 4 модели в таблице
    for name in ["LogisticRegression", "DecisionTree", "RandomForest", "CatBoost"]:
        assert name in out, f"Не найдена модель {name} в выводе"

    # Лучшая модель — CatBoost (в норме)
    assert "Лучшая модель: CatBoost" in out, \
        "Лучшей моделью должен быть CatBoost"

    # Файл сохранён
    assert os.path.exists('/workspace/best_model.pkl'), \
        "Модель не сохранена в /workspace/best_model.pkl"