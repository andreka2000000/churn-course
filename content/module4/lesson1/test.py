import io, sys, runpy, re, os

def test_shap_analysis():
    # Запускаем если файл ещё не создан
    if not os.path.exists('/workspace/shap_summary.png'):
        runpy.run_path('/workspace/solution.py')

    # Проверяем наличие графика
    assert os.path.exists('/workspace/shap_summary.png'), \
        "График SHAP не создан в /workspace/shap_summary.png"

    # Проверяем вывод топ-5
    captured = io.StringIO()
    old = sys.stdout
    sys.stdout = captured
    try:
        runpy.run_path('/workspace/solution.py')
    finally:
        sys.stdout = old
    out = captured.getvalue()

    assert "Топ-5 признаков по SHAP:" in out, "Не выведен топ-5 признаков"

    # Хотя бы стаж или просрочки должны быть в топ-5
    assert "стаж_месяцев" in out or "просрочки_платежей_12мес" in out, \
        "В топ-5 должны быть стаж или просрочки"