import io, sys, runpy, re

def test_psi_calculated():
    captured = io.StringIO()
    old = sys.stdout
    sys.stdout = captured
    try:
        runpy.run_path('/workspace/solution.py')
    finally:
        sys.stdout = old
    out = captured.getvalue()

    # Все признаки должны быть в выводе
    for feat in ['стаж_месяцев', 'ежемесячный_платёж_руб', 'arpu_руб', 'средний_трафик_гб', 'возраст']:
        assert feat in out, f"Не найден PSI для '{feat}'"

    # Извлекаем PSI для ежемесячного платежа
    match = re.search(r"ежемесячный_платёж_руб\s*\|\s*([\d.]+)", out)
    assert match, "Не найден PSI для ежемесячного платежа"
    psi = float(match.group(1))

    # Так как мы умножили на 1.3, дрейф должен быть сильным (> 0.25)
    assert psi > 0.25, f"PSI для ежемесячного платежа должен быть > 0.25 (получено {psi})"