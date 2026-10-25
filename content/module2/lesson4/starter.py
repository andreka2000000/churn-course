import pandas as pd
from sklearn.model_selection import train_test_split
from imblearn.over_sampling import SMOTE

df = pd.read_csv('/data/churn_ru.csv')

# 1. Подготовка X и y (пока используем только числовые колонки,
#    чтобы не возиться с категориальными — это сделаем в 2.5)
numeric_cols = df.select_dtypes(include='number').columns.drop('отток')
X = df[numeric_cols]
y = df['отток']

# 2. Train/test split (скопируйте как есть — подробности в уроке 2.5)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# 3. SMOTE — применяем ТОЛЬКО к тренировочной выборке
smote = SMOTE(random_state=42)
X_train_res, y_train_res = ...  # ваш код: примените smote к X_train, y_train

# 4. Вывод
print("До SMOTE:")
print(y_train.value_counts())
print("\nПосле SMOTE:")
print(...)  # ваш код: распределение классов после SMOTE