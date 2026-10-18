import io, sys, runpy, re

def test_dataset_loads():
    import pandas as pd
    df = pd.read_csv('/data/churn_ru.csv')
    assert df.shape == (7043, 24), "Ожидалось 7043 строки и 24 колонки"

def test_output_correct():
    captured = io.StringIO()
    old = sys.stdout
    sys.stdout = captured
    try:
        runpy.run_path('/workspace/solution.py')
    finally:
        sys.stdout = old
    out = captured.getvalue()

    assert re.search(r"Строк:\s*7043.*колонок:\s*24", out), \
        "Ожидалось 'Строк: 7043, колонок: 24'"

    assert "id_клиента" in out, "Выведите список колонок"
    assert "отток" in out, "В списке колонок должна быть 'отток'"

    assert "5174" in out or "1869" in out, \
        "Выведите value_counts() по колонке 'отток'"