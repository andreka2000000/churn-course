import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score
from catboost import CatBoostClassifier

df = pd.read_csv('/data/churn_ru.csv')

y = df['отток']
X = df.drop(columns=['отток', 'id_клиента'])

# Найти все категориальные колонки
cat_cols = X.select_dtypes(include='object').columns.tolist()
# CatBoost плохо работает с пропусками в категориях — заменим на строку 'unknown'
for col in cat_cols:
    X[col] = X[col].fillna('unknown').astype(str)

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# 1. Обучаем CatBoost
model = CatBoostClassifier(
    iterations=500,
    depth=6,
    learning_rate=0.1,
    cat_features=cat_cols,
    verbose=False,
    random_seed=42
)

model.fit(X_train, y_train)

# 2. Считаем метрики
y_proba = ...  # ваш код: вероятности класса 1 на тесте
auc = ...  # ваш код: ROC-AUC
print(f"CatBoost ROC-AUC: {auc:.4f}")

# 3. Сравнение с Random Forest (из урока 3.3, ~0.82)
print(f"Random Forest (из 3.3) был ~0.82")