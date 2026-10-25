import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split

# 1. Загружаем готовую модель и данные
best_model = joblib.load('/data/best_model.pkl')
df = pd.read_csv('/data/churn_ru.csv')

y = df['отток']
X = df.drop(columns=['отток', 'id_клиента'])

cat_cols = X.select_dtypes(include='object').columns.tolist()
for col in cat_cols:
    X[col] = X[col].fillna('unknown').astype(str)

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

# 2. Получаем вероятности оттока
probs = ...  # ваш код: вероятности класса 1 на X_test

# 3. Собираем DataFrame для анализа
test_df = pd.DataFrame({
    'prob': probs,
    'отток': y_test.values
}).sort_values('prob', ascending=False).reset_index(drop=True)

# 4. Параметры бизнеса
LTV = 30_000
COST_PER_ATTEMPT = 800
EFFECTIVE_RATE = 0.4

print(f"{'N':>6} | {'Реально уходят':>15} | {'Удержим':>8} | {'Экономия':>15} | {'Затраты':>12} | {'Эффект':>15}")
print("-" * 90)

results = []
for n in [100, 200, 500, 1000, 2000]:
    top_n = test_df.head(n)
    actual_churn = ...  # ваш код: доля реально уходящих в топ-N
    retained = ...  # ваш код: сколько удержим
    savings = ...  # ваш код: экономия в рублях
    costs = ...  # ваш код: затраты в рублях
    net = savings - costs

    results.append({'n': n, 'net': net})
    print(f"{n:>6} | {actual_churn:>14.1%} | {retained:>8.0f} | {savings:>14,.0f} ₽ | {costs:>11,.0f} ₽ | {net:>14,.0f} ₽")

# 5. Оптимальный N
best = max(results, key=lambda x: x['net'])
print(f"\nОптимальный размер кампании: {best['n']} клиентов, чистый эффект: {best['net']:,.0f} ₽")