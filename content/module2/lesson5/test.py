import io, sys, runpy, re

def test_pipeline_works():
    captured = io.StringIO()
    old = sys.stdout
    sys.stdout = captured
    try:
        runpy.run_path('/workspace/solution.py')
    finally:
        sys.stdout = old
    out = captured.getvalue()

    # Проверяем, что accuracy выведена
    assert "Accuracy на тесте:" in out, "Не найден вывод accuracy"

    # Извлекаем процент
    match = re.search(r"Accuracy на тесте:\s*([\d.]+)%", out)
    assert match, "Accuracy должна быть в формате 'XX.XX%'"

    value = float(match.group(1))
    # Модель должна обучиться и показать разумное качество (больше 60%)
    assert value > 60.0, f"Accuracy слишком низкая ({value}%) — проверьте пайплайн"