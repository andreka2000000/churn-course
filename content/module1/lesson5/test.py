import io, sys, runpy, re

def test_five_insights():
    captured = io.StringIO()
    old = sys.stdout
    sys.stdout = captured
    try:
        runpy.run_path('/workspace/solution.py')
    finally:
        sys.stdout = old
    out = captured.getvalue()

    # 5 инсайтов пронумерованы
    for i in range(1, 6):
        assert f"{i}. Инсайт:" in out, f"Не найден инсайт №{i}"

    # В инсайтах есть реальные проценты
    assert len(re.findall(r"\d+\.\d+%", out)) >= 5, \
        "Инсайты должны содержать конкретные % из данных"