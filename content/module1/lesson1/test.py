import io, sys, runpy, re

def test_dataset_loads():
    import pandas as pd
    df = pd.read_csv('/data/churn_ru.csv')
    assert len(df) == 7043, "Датасет должен содержать 7043 строки"

def test_churn_rate_correct():
    captured = io.StringIO()
    old = sys.stdout
    sys.stdout = captured
    try:
        runpy.run_path('/workspace/solution.py')
    finally:
        sys.stdout = old
    output = captured.getvalue()

    assert "Churn rate:" in output, "Выведите строку 'Churn rate: ...'"
    match = re.search(r"Churn rate:\s*([\d.]+)%", output)
    assert match, "Churn rate должен быть в формате '26.54%'"
    value = float(match.group(1))
    assert 26.0 <= value <= 27.0, f"Churn rate должен быть ≈26.5%, у вас {value}%"