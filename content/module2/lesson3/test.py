import io, sys, runpy, re

def test_feature_engineering():
    captured = io.StringIO()
    old = sys.stdout
    sys.stdout = captured
    try:
        runpy.run_path('/workspace/solution.py')
    finally:
        sys.stdout = old
    out = captured.getvalue()

    # Проверяем, что новые колонки выведены
    for col in ['arpu_на_услугу', 'доля_просрочек', 'средний_чек']:
        assert col in out, f"Колонка '{col}' не выведена"

    # Проверяем, что бесконечностей 0
    assert "Бесконечностей в новых колонках: 0" in out, \
        "В новых колонках не должно быть бесконечностей (inf)"