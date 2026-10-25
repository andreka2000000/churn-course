import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import roc_auc_score
from catboost import CatBoostClassifier

df = pd.read_csv('/data/churn_ru.csv')

y = df['отток']
X = df.drop(columns=['отток', 'id_клиента'])

numeric_cols = X.select_dtypes(include='number').columns.tolist()
cat_cols = X.select_dtypes(include='object').columns.tolist()

# CatBoost: заполняем категории и приводим к str
X_cb = X.copy()
for col in cat_cols:
    X_cb[col] = X_cb[col].fillna('unknown').astype(str)

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)
Xc_train, Xc_test, _, _ = train_test_split(
    X_cb, y, test_size=0.2, random_state=42, stratify=y
)

# Препроцессор для sklearn-моделей
preprocessor = ColumnTransformer([
    ('num', StandardScaler(), numeric_cols),
    ('cat', OneHotEncoder(handle_unknown='ignore'), cat_cols)
])

# 1. Logistic Regression
pipe_lr = Pipeline([('prep', preprocessor), ('model', LogisticRegression(class_weight='balanced', max_iter=1000))])
pipe_lr.fit(X_train, y_train)
auc_lr = ...  # ваш код: ROC-AUC

# 2. Decision Tree
pipe_dt = Pipeline([('prep', preprocessor), ('model', DecisionTreeClassifier(max_depth=5, class_weight='balanced', random_state=42))])
pipe_dt.fit(X_train, y_train)
auc_dt = ...  # ваш код: ROC-AUC

# 3. Random Forest
pipe_rf = Pipeline([('prep', preprocessor), ('model', RandomForestClassifier(n_estimators=100, max_depth=10, class_weight='balanced', random_state=42, n_jobs=-1))])
pipe_rf.fit(X_train, y_train)
auc_rf = ...  # ваш код: ROC-AUC

# 4. CatBoost
model_cb = CatBoostClassifier(iterations=500, depth=6, learning_rate=0.1, cat_features=cat_cols, verbose=False, random_seed=42)
model_cb.fit(Xc_train, y_train)
auc_cb = ...  # ваш код: ROC-AUC

# 5. Собираем таблицу
results = pd.DataFrame([
    {"model": "LogisticRegression", "roc_auc": auc_lr, "obj": pipe_lr},
    {"model": "DecisionTree",       "roc_auc": auc_dt, "obj": pipe_dt},
    {"model": "RandomForest",       "roc_auc": auc_rf, "obj": pipe_rf},
    {"model": "CatBoost",           "roc_auc": auc_cb, "obj": model_cb},
]).sort_values("roc_auc", ascending=False).reset_index(drop=True)

print("Сравнение моделей:")
print(results[["model", "roc_auc"]].to_string(index=False))

# 6. Сохраняем лучшую
best_name = results.iloc[0]["model"]
best_obj = results.iloc[0]["obj"]
joblib.dump(best_obj, '/workspace/best_model.pkl')

print(f"\nЛучшая модель: {best_name}")