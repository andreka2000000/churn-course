import io, sys, runpy, re

def test_smote_balanced():
    captured = io.StringIO()
    old = sys.stdout
    sys.stdout = captured
    try:
        runpy.run_path('/workspace/solution.py')
    finally:
        sys.stdout = old
    out = captured.getvalue()

    assert "До SMOTE:" in out, "Не найден вывод 'До SMOTE:'"
    assert "После SMOTE:" in out, "Не найден вывод 'После SMOTE:'"

    # Проверка баланса: после SMOTE количество 0 и 1 должно быть примерно одинаковым
    # Найдём числа в блоке "После SMOTE:"
    after_block = out.split("После SMOTE:")[1]
    nums = [int(n) for n in re.findall(r"\b\d+\b", after_block)]

    # Найти два больших числа (это будут размеры классов)
    big_nums = [n for n in nums if n > 1000]
    assert len(big_nums) >= 2, "Не найдены числа размеров классов после SMOTE"

    n0, n1 = big_nums[0], big_nums[1]
    assert n0 == n1, f"После SMOTE классы должны быть одинакового размера ({n0} vs {n1})"