import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.linear_model import LogisticRegression

df = pd.read_csv('/data/churn_ru.csv')

# 1. Подготовка X и y
y = df['отток']
X = df.drop(columns=['отток'])
X = X.drop(columns=['id_клиента'])  # id не признак

numeric_cols = X.select_dtypes(include='number').columns.tolist()
categorical_cols = X.select_dtypes(include='object').columns.tolist()

# 2. Train/test split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# 3. Pipeline
preprocessor = ColumnTransformer([
    ('num', StandardScaler(), numeric_cols),
    ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_cols)
])

pipe = Pipeline([
    ('preprocessor', preprocessor),
    ('model', LogisticRegression(class_weight='balanced', max_iter=1000))
])

# 4. Обучение
pipe.fit(X_train, y_train)

# 5. Анализ весов
feature_names = pipe.named_steps['preprocessor'].get_feature_names_out()
weights = pipe.named_steps['model'].coef_[0]

# Найти веса для трёх ключевых признаков
for feat in ['стаж_месяцев', 'жалобы_12мес', 'просрочки_платежей_12мес']:
    idx = np.where(feature_names == f'num__{feat}')[0]
    if len(idx) > 0:
        print(f"Вес признака {feat}: {weights[idx[0]]:+.4f}")