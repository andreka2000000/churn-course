import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler

df = pd.read_csv('/data/churn_ru.csv')

# 1. Создаём новые признаки
df['arpu_на_услугу'] = ...  # ваш код
df['доля_просрочек'] = ...  # ваш код
df['средний_чек'] = ...  # ваш код

# Защита от бесконечностей (если что-то поделилось на 0)
df = df.replace([np.inf, -np.inf], 0)
df = df.fillna(0)

# 2. Масштабируем числовые признаки
scaler = StandardScaler()
cols_to_scale = ['возраст', 'стаж_месяцев', 'ежемесячный_платёж_руб']
df[cols_to_scale] = scaler.fit_transform(df[cols_to_scale])

# 3. Проверяем
print("Новые признаки:")
print(df[['arpu_на_услугу', 'доля_просрочек', 'средний_чек']].describe())

print(f"\nБесконечностей в новых колонках: {np.isinf(df[['arpu_на_услугу', 'доля_просрочек', 'средний_чек']]).sum().sum()}")