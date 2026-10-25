import pandas as pd
from sklearn.preprocessing import LabelEncoder

df = pd.read_csv('/data/churn_ru.csv')

# 1. Удаляем идентификатор
df = ...  # ваш код: удалите колонку id_клиента

# 2. One-Hot для номинальных категорий
df = pd.get_dummies(
    df,
    columns=[...]  # ваш код: список колонок
)

# 3. Label Encoding для упорядоченного тарифа
le = LabelEncoder()
df['тариф_код'] = le.fit_transform(df['тариф'])
df = df.drop(columns=['тариф'])

print(f"Колонок после кодирования: {len(df.columns)}")