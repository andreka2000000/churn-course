import io, sys, runpy, re

def test_weights_correct():
    captured = io.StringIO()
    old = sys.stdout
    sys.stdout = captured
    try:
        runpy.run_path('/workspace/solution.py')
    finally:
        sys.stdout = old
    out = captured.getvalue()

    # Ищем веса
    for feat in ['стаж_месяцев', 'жалобы_12мес', 'просрочки_платежей_12мес']:
        assert f"Вес признака {feat}:" in out, f"Не найден вес для '{feat}'"

    # Извлекаем веса
    tenure_match = re.search(r"Вес признака стаж_месяцев:\s*([+-]?[\d.]+)", out)
    complaints_match = re.search(r"Вес признака жалобы_12мес:\s*([+-]?[\d.]+)", out)

    tenure_w = float(tenure_match.group(1))
    complaints_w = float(complaints_match.group(1))

    # Ожидаем: стаж уменьшает отток, жалобы увеличивают
    assert tenure_w < 0, f"Вес стажа должен быть отрицательным, получен {tenure_w}"
    assert complaints_w > 0, f"Вес жалоб должен быть положительным, получен {complaints_w}"