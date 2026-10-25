import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import roc_auc_score

df = pd.read_csv('/data/churn_ru.csv')

y = df['отток']
X = df.drop(columns=['отток', 'id_клиента'])

numeric_cols = X.select_dtypes(include='number').columns.tolist()
categorical_cols = X.select_dtypes(include='object').columns.tolist()

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

preprocessor = ColumnTransformer([
    ('num', StandardScaler(), numeric_cols),
    ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_cols)
])

# 1. Decision Tree
dt = Pipeline([
    ('preprocessor', preprocessor),
    ('model', DecisionTreeClassifier(max_depth=5, random_state=42, class_weight='balanced'))
])
dt.fit(X_train, y_train)
dt_auc = ...  # ваш код: ROC-AUC для Decision Tree
print(f"Decision Tree ROC-AUC: {dt_auc:.4f}")

# 2. Random Forest
rf = Pipeline([
    ('preprocessor', preprocessor),
    ('model', RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42, class_weight='balanced', n_jobs=-1))
])
rf.fit(X_train, y_train)
rf_auc = ...  # ваш код: ROC-AUC для Random Forest
print(f"Random Forest ROC-AUC: {rf_auc:.4f}")

# 3. Feature importances из RF
feature_names = ...  # ваш код: имена фич после preprocessor
importances = ...  # ваш код: важности признаков из RF

# Топ-10 признаков
top_idx = np.argsort(importances)[-10:][::-1]
print("\nТоп-10 признаков (Random Forest):")
for i in top_idx:
    print(f"  {feature_names[i]}: {importances[i]:.4f}")