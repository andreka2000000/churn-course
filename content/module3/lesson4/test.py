import io, sys, runpy, re

def test_catboost_quality():
    captured = io.StringIO()
    old = sys.stdout
    sys.stdout = captured
    try:
        runpy.run_path('/workspace/solution.py')
    finally:
        sys.stdout = old
    out = captured.getvalue()

    # Найти AUC
    match = re.search(r"CatBoost ROC-AUC:\s*([\d.]+)", out)
    assert match, "Не найден ROC-AUC CatBoost"

    auc = float(match.group(1))

    # CatBoost должен быть не хуже RF (0.82)
    assert auc > 0.82, f"CatBoost ROC-AUC слишком низкий ({auc}) — проверьте параметры"
    assert auc < 0.95, f"CatBoost ROC-AUC подозрительно высокий ({auc}) — возможен data leakage"