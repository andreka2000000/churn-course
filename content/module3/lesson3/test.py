import io, sys, runpy, re

def test_models_compared():
    captured = io.StringIO()
    old = sys.stdout
    sys.stdout = captured
    try:
        runpy.run_path('/workspace/solution.py')
    finally:
        sys.stdout = old
    out = captured.getvalue()

    # Найти AUC обеих моделей
    dt_match = re.search(r"Decision Tree ROC-AUC:\s*([\d.]+)", out)
    rf_match = re.search(r"Random Forest ROC-AUC:\s*([\d.]+)", out)

    assert dt_match, "Не найден ROC-AUC Decision Tree"
    assert rf_match, "Не найден ROC-AUC Random Forest"

    dt_auc = float(dt_match.group(1))
    rf_auc = float(rf_match.group(1))

    # Random Forest должен быть лучше Decision Tree
    assert rf_auc > dt_auc, \
        f"Random Forest ({rf_auc}) должен быть лучше Decision Tree ({dt_auc})"

    # Оба должны быть > 0.7
    assert dt_auc > 0.70, f"Decision Tree ROC-AUC слишком низкий: {dt_auc}"
    assert rf_auc > 0.75, f"Random Forest ROC-AUC слишком низкий: {rf_auc}"

    # Feature importances должны быть выведены
    assert "Топ-10 признаков" in out, "Не выведены feature importances"