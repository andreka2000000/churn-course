import io, sys, runpy

def test_report_complete():
    captured = io.StringIO()
    old = sys.stdout
    sys.stdout = captured
    try:
        runpy.run_path('/workspace/solution.py')
    finally:
        sys.stdout = old
    out = captured.getvalue()

    # Все обязательные секции должны быть в отчёте
    sections = [
        "Executive Summary",
        "Качество модели",
        "Топ-5 самых важных признаков",
        "Экономический эффект",
        "Рекомендации",
        "Следующие шаги",
    ]
    for sec in sections:
        assert sec in out, f"Отсутствует секция '{sec}'"

    # ROC-AUC указан
    assert "ROC-AUC" in out, "Не указан ROC-AUC"

    # Чистый эффект указан
    assert "Чистый эффект" in out, "Не указан чистый эффект в рублях"

    # ROI или экономия в рублях
    assert "₽" in out, "Не указаны суммы в рублях"