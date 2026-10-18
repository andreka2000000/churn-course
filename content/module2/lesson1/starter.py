import pandas as pd

df = pd.read_csv('/data/churn_ru.csv')

# 1. Смотрим на пропуски
total_nans = df.isna().sum().sum()
print(f"Всего пропусков до очистки: {total_nans}")

# 2. Заполняем пропуски в суммарных платежах нулём
df['суммарные_платежи_руб'] = df['суммарные_платежи_руб'].fillna(0)

# 3. Ищем выбросы в ARPU по правилу IQR
print(f"Максимальный ARPU до обрезки: {df['arpu_руб'].max():.1f}")

Q1 = df['arpu_руб'].quantile(0.25)
Q3 = df['arpu_руб'].quantile(0.75)
IQR = Q3 - Q1

lower = ...  # ваш код
upper = ...  # ваш код

outliers_count = ((df['arpu_руб'] < lower) | (df['arpu_руб'] > upper)).sum()
print(f"Найдено выбросов: {outliers_count}")

# 4. Обрезаем выбросы
df['arpu_руб'] = ...  # ваш код (используйте .clip)
print(f"Максимальный ARPU после обрезки: {df['arpu_руб'].max():.1f}")