import io, sys, runpy, re

def test_metrics_correct():
    captured = io.StringIO()
    old = sys.stdout
    sys.stdout = captured
    try:
        runpy.run_path('/workspace/solution.py')
    finally:
        sys.stdout = old
    out = captured.getvalue()

    # Проверяем, что все метрики выведены
    for metric in ['Precision', 'Recall', 'F1-score', 'ROC-AUC']:
        assert f"{metric}:" in out, f"Не найден вывод '{metric}'"

    # ROC-AUC должен быть разумным (> 0.7)
    auc_match = re.search(r"ROC-AUC:\s*([\d.]+)", out)
    assert auc_match, "Не найден ROC-AUC"
    auc = float(auc_match.group(1))
    assert auc > 0.70, f"ROC-AUC слишком низкий ({auc}) — проверьте пайплайн"
    assert auc < 0.95, f"ROC-AUC слишком высокий ({auc}) — подозрительно, возможно data leakage"