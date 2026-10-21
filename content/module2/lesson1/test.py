import io, sys, runpy, re

def test_cleaning_correct():
    captured = io.StringIO()
    old = sys.stdout
    sys.stdout = captured
    try:
        runpy.run_path('/workspace/solution.py')
    finally:
        sys.stdout = old
    out = captured.getvalue()

    assert "Всего пропусков до очистки:" in out, "Не выведено количество пропусков"

    # До обрезки максимум должен быть большим (больше 1000)
    match_before = re.search(r"Максимальный ARPU до обрезки:\s*([\d.]+)", out)
    assert match_before, "Не найден вывод ARPU до обрезки"
    assert float(match_before.group(1)) > 500, "До обрезки максимальный ARPU должен быть большим"

    # После обрезки максимум должен быть меньше
    match_after = re.search(r"Максимальный ARPU после обрезки:\s*([\d.]+)", out)
    assert match_after, "Не найден вывод ARPU после обрезки"
    
    assert float(match_after.group(1)) < float(match_before.group(1)), \
        "После обрезки максимальный ARPU должен уменьшиться"