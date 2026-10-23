import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.ensemble import RandomForestClassifier
from catboost import CatBoostClassifier
from sklearn.metrics import roc_auc_score

print("Загрузка данных...")
df = pd.read_csv('/data/churn_ru.csv')
y = df['отток']
X = df.drop(columns=['отток', 'id_клиента'])

numeric_cols = X.select_dtypes(include='number').columns.tolist()
cat_cols = X.select_dtypes(include='object').columns.tolist()

X_cb = X.copy()
for col in cat_cols:
    X_cb[col] = X_cb[col].fillna('unknown').astype(str)

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
Xc_train, Xc_test, _, _ = train_test_split(X_cb, y, test_size=0.2, random_state=42, stratify=y)

print("Обучение моделей...")
prep = ColumnTransformer([('num', StandardScaler(), numeric_cols), ('cat', OneHotEncoder(handle_unknown='ignore'), cat_cols)])
rf = Pipeline([('prep', prep), ('model', RandomForestClassifier(n_estimators=100, random_state=42))]).fit(X_train, y_train)
rf_auc = roc_auc_score(y_test, rf.predict_proba(X_test)[:, 1])

cb = CatBoostClassifier(iterations=500, verbose=False, cat_features=cat_cols, random_seed=42).fit(Xc_train, y_train)
cb_auc = roc_auc_score(y_test, cb.predict_proba(Xc_test)[:, 1])

if cb_auc > rf_auc:
    best_model = cb
    print(f"Победил CatBoost (AUC: {cb_auc:.4f})")
else:
    best_model = rf
    print(f"Победил RandomForest (AUC: {rf_auc:.4f})")

print("Сохранение модели...")
joblib.dump(best_model, '/data/best_model.pkl')
print("✅ Модель сохранена в /data/best_model.pkl")