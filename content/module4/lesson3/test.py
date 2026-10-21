import io, sys, runpy, re

def test_api_works():
    captured = io.StringIO()
    old = sys.stdout
    sys.stdout = captured
    try:
        runpy.run_path('/workspace/solution.py')
    finally:
        sys.stdout = old
    out = captured.getvalue()

    # Все три теста должны быть в выводе
    assert "Тест 1 (лояльный):" in out, "Не найден тест 1"
    assert "Тест 2 (проблемный):" in out, "Не найден тест 2"
    assert "Тест 3 (невалидные данные" in out, "Не найден тест 3"

    # Лояльный клиент: вероятность низкая (< 0.5)
    match1 = re.search(r"Тест 1 \(лояльный\):.*'probability':\s*([\d.]+).*'will_churn':\s*(\w+)", out)
    assert match1, "Не удалось извлечь результат теста 1"
    assert match1.group(2) == 'False', "Лояльный клиент НЕ должен попадать в зону риска"

    # Проблемный клиент: высокая вероятность (> 0.5)
    match2 = re.search(r"Тест 2 \(проблемный\):.*'probability':\s*([\d.]+).*'will_churn':\s*(\w+)", out)
    assert match2, "Не удалось извлечь результат теста 2"
    assert match2.group(2) == 'True', "Проблемный клиент ДОЛЖЕН попадать в зону риска"

    # Невалидные данные: ошибка 422
    assert "статус 422" in out, "Невалидные данные должны давать ошибку 422"