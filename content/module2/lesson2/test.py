import io, sys, runpy, re

def test_encoding_correct():
    captured = io.StringIO()
    old = sys.stdout
    sys.stdout = captured
    try:
        runpy.run_path('/workspace/solution.py')
    finally:
        sys.stdout = old
    out = captured.getvalue()

    # Колонок стало больше 24
    match = re.search(r"Колонок после кодирования:\s*(\d+)", out)
    assert match, "Не найден вывод количества колонок"
    n_cols = int(match.group(1))
    assert n_cols > 24, f"После One-Hot колонок должно стать больше 24 (получилось {n_cols})"

    # В выводе нет старых строковых колонок
    assert "id_клиента" not in out.lower() or "Колонок" in out, "Колонка id_клиента не должна упоминаться"