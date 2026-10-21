import pandas as pd

# Загрузите датасет оператора «СвязьТелеком»
df = pd.read_csv('/data/churn_ru.csv')

# Посчитайте churn rate (долю ушедших клиентов)
# колонка с целевой переменной называется 'отток'
churn_rate = ...  # ваш код

print(f"Строк в датасете: {len(df)}")
print(f"Churn rate: {churn_rate:.2%}")