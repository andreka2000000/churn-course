import io, sys, runpy

def test_correct():
    captured = io.StringIO()
    old = sys.stdout
    sys.stdout = captured
    try:
        runpy.run_path('/workspace/solution.py')
    finally:
        sys.stdout = old
    out = captured.getvalue()

    for kind in ["Безсрочный", "1 год", "2 года"]:
        assert kind in out, f"Ожидалось '{kind}' в выводе"

    assert "Максимальный отток у договора: Безсрочный" in out, \
        "Самый высокий отток должен быть у безсрочного договора"