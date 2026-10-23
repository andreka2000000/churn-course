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
    scores = {}
    for name in ["LogisticRegression", "DecisionTree", "RandomForest", "CatBoost"]:
        m = re.search(rf"{name}\s+([\d.]+)", out)
        assert m, f"Не найдена модель {name} в выводе"
        scores[name] = float(m.group(1))

    # Лучшая модель названа и совпадает с максимумом по ROC-AUC
    m = re.search(r"Лучшая модель:\s*(\w+)", out)
    assert m, "Не найдена строка 'Лучшая модель: ...'"
    assert m.group(1) == max(scores, key=scores.get), \
        f"Названа {m.group(1)}, но лучший ROC-AUC у {max(scores, key=scores.get)}"

    # Файл сохранён
    assert os.path.exists('/workspace/best_model.pkl'), \
        "Модель не сохранена в /workspace/best_model.pkl"