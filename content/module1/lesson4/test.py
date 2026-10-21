import os
import io, sys, runpy

def test_plot_saved():
    # Запустим решение, если файл ещё не создан
    if not os.path.exists('/workspace/tenure_hist.png'):
        runpy.run_path('/workspace/solution.py')
    assert os.path.exists('/workspace/tenure_hist.png'), \
        "График /workspace/tenure_hist.png не был создан"

def test_correlation_output():
    captured = io.StringIO()
    old = sys.stdout
    sys.stdout = captured
    try:
        runpy.run_path('/workspace/solution.py')
    finally:
        sys.stdout = old
    out = captured.getvalue()

    # Проверяем, что в выводе есть хотя бы одно из ключевых слов
    keywords = ['стаж_месяцев', 'просрочки_платежей_12мес', 'жалобы_12мес']
    assert any(k in out for k in keywords), \
        "В выводе не найдена корреляция с ключевыми признаками"