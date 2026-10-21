import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.linear_model import LogisticRegression

df = pd.read_csv('/data/churn_ru.csv')

# 1. Готовим X и y
y = df['отток']
X = df.drop(columns=['отток'])

# 2. Определяем типы колонок
numeric_cols = X.select_dtypes(include='number').columns.tolist()
categorical_cols = X.select_dtypes(include='object').columns.tolist()

# 3. Train/test split со стратификацией
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# 4. Собираем ColumnTransformer
preprocessor = ColumnTransformer([
    ('num', StandardScaler(), numeric_cols),
    ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_cols)
])

# 5. Оборачиваем в Pipeline
pipe = Pipeline([
    ('preprocessor', preprocessor),
    ('model', LogisticRegression(class_weight='balanced', max_iter=1000))
])

# 6. Обучаем
pipe.fit(X_train, y_train)

# 7. Оцениваем
acc = pipe.score(X_test, y_test)
print(f"Accuracy на тесте: {acc:.2%}")