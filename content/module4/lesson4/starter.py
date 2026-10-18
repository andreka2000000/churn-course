import pandas as pd
import numpy as np

def calculate_psi(expected, actual, bins=10):
    """Population Stability Index для числового признака."""
    # Точки разбиения по тренировочным данным
    breakpoints = np.percentile(expected, np.linspace(0, 100, bins + 1))
    breakpoints[0] = -np.inf
    breakpoints[-1] = np.inf

    # Доли в бакетах
    expected_counts = np.histogram(expected, bins=breakpoints)[0] / len(expected)
    actual_counts = np.histogram(actual, bins=breakpoints)[0] / len(actual)

    # Защита от log(0)
    expected_counts = np.where(expected_counts == 0, 0.0001, expected_counts)
    actual_counts = np.where(actual_counts == 0, 0.0001, actual_counts)

    # PSI
    return np.sum((actual_counts - expected_counts) * np.log(actual_counts / expected_counts))

# 1. Загружаем данные
df = pd.read_csv('/data/churn_ru.csv')

# «Train» — 80% данных
train = df.sample(frac=0.8, random_state=42)

# «Новые» данные — оставшиеся 20%, но с искусственным дрейфом:
# ежемесячный платёж умножен на 1.3 (оператор поднял цены)
new = df.drop(train.index).copy()
new['ежемесячный_платёж_руб'] = new['ежемесячный_платёж_руб'] * 1.3

# 2. Признаки для проверки
features = ['стаж_месяцев', 'ежемесячный_платёж_руб', 'arpu_руб', 'средний_трафик_гб', 'возраст']

# 3. Считаем PSI
print(f"{'Признак':<30} | {'PSI':>8} | {'Вывод':<20}")
print("-" * 65)

for feat in features:
    psi = calculate_psi(train[feat].dropna().values, new[feat].dropna().values)
    if psi < 0.1:
        verdict = "Стабильно"
    elif psi < 0.25:
        verdict = "Умеренный дрейф"
    else:
        verdict = "⚠️ Сильный дрейф"

    print(f"{feat:<30} | {psi:>8.4f} | {verdict}")