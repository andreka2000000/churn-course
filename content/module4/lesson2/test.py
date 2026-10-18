import io, sys, runpy, re

def test_business_roi():
    captured = io.StringIO()
    old = sys.stdout
    sys.stdout = captured
    try:
        runpy.run_path('/workspace/solution.py')
    finally:
        sys.stdout = old
    out = captured.getvalue()

    # Проверяем, что таблица выведена
    for n in ['100', '500', '2000']:
        assert n in out, f"Не найдено N={n} в выводе"

    # Проверяем, что есть строка про оптимальный размер
    assert "Оптимальный размер кампании:" in out, \
        "Не найден вывод оптимального N"

    # Извлекаем эффект
    match = re.search(r"Оптимальный размер кампании:\s*\d+\s*клиентов,\s*чистый эффект:\s*([\d,]+)", out)
    assert match, "Не удалось извлечь чистый эффект"

    # Эффект должен быть положительным
    effect = int(match.group(1).replace(',', ''))
    assert effect > 0, f"Чистый эффект должен быть положительным (получено {effect})"