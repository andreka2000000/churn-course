import pandas as pd
import matplotlib
matplotlib.use('Agg')  # чтобы matplotlib работал в песочнице без экрана
import matplotlib.pyplot as plt

df = pd.read_csv('/data/churn_ru.csv')

# 1. Гистограмма стажа: оставшиеся vs ушедшие
fig, ax = plt.subplots(figsize=(8, 4))

df[df['отток'] == 0]['стаж_месяцев'].hist(
    ax=ax, alpha=0.6, label='Остались', bins=30
)
df[df['отток'] == 1]['стаж_месяцев'].hist(
    ax=ax, alpha=0.6, label='Ушли', bins=30
)

ax.set_xlabel('Стаж, месяцев')
ax.legend()
plt.savefig('/workspace/tenure_hist.png')

# 2. Корреляция с оттоком (только числовые колонки)
# ваш код