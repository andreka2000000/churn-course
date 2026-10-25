import pandas as pd
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import shap
import joblib
from sklearn.model_selection import train_test_split

# 1. Загружаем готовую модель из /data/
best_model = joblib.load('/data/best_model.pkl')

df = pd.read_csv('/data/churn_ru.csv')
y = df['отток']
X = df.drop(columns=['отток', 'id_клиента'])

cat_cols = X.select_dtypes(include='object').columns.tolist()
for col in cat_cols:
    X[col] = X[col].fillna('unknown').astype(str)

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# 2. SHAP explainer
explainer = ...  # ваш код: создайте TreeExplainer для best_model
shap_values = ...  # ваш код: посчитайте SHAP-значения для X_test

# 3. Строим summary plot и сохраняем
plt.figure()
shap.summary_plot(shap_values, X_test, show=False, max_display=15)
plt.tight_layout()
plt.savefig('/workspace/shap_summary.png', dpi=100, bbox_inches='tight')
plt.close()

# 4. Топ-5 признаков по средней абсолютной SHAP
mean_abs_shap = ...  # ваш код: средняя абсолютная SHAP по признакам
top_idx = np.argsort(mean_abs_shap)[-5:][::-1]

print("Топ-5 признаков по SHAP:")
for i in top_idx:
    print(f"  {X_test.columns[i]}: {mean_abs_shap[i]:.4f}")

print("\nSHAP summary plot сохранён в /workspace/shap_summary.png")