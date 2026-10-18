import pandas as pd

df = pd.read_csv('/data/churn_ru.csv')

# 1. Средний отток по типу договора
by_contract = ...  # ваш код

print("Отток по типу договора:")
print(by_contract)

# 2. Тип с максимальным оттоком
worst = ...  # ваш код
print(f"Максимальный отток у договора: {worst}")