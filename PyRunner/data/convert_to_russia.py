"""
Конвертер датасета Telco Customer Churn (IBM, США) в датасет российского
телеком-оператора «СвязьТелеком».
"""
import sys
import random
import pandas as pd
import numpy as np

random.seed(42)
np.random.seed(42)

REGIONS = {
    "Москва": 0.30,
    "Санкт-Петербург": 0.15,
    "Новосибирск": 0.08,
    "Екатеринбург": 0.08,
    "Казань": 0.06,
    "Регионы": 0.33,
}

INTERNET_MAP = {
    "DSL": "ADSL",
    "Fiber optic": "GPON",
    "No": "Нет",
    "No internet service": "Нет",
}

def tariff_from_price(monthly_rub: int) -> str:
    if monthly_rub < 400:
        return "Мини"
    if monthly_rub < 700:
        return "Смарт"
    if monthly_rub < 1000:
        return "Смарт+"
    if monthly_rub < 1500:
        return "Ультра"
    return "Премиум"

CONTRACT_MAP = {
    "Month-to-month": "Безсрочный",
    "One year": "1 год",
    "Two year": "2 года",
}

PAYMENT_MAP = {
    "Electronic check": "СБП",
    "Mailed check": "Наличные",
    "Bank transfer (automatic)": "Автоплатёж",
    "Credit card (automatic)": "Карта",
}

YN = {"Yes": 1, "No": 0, "No internet service": 0, "No phone service": 0}
GENDER_MAP = {"Male": "М", "Female": "Ж"}
PARTNER_MAP = {"Yes": "Женат/Замужем", "No": "Холост/Не замужем"}


def convert(input_path: str, output_path: str = "churn_ru.csv") -> None:
    df = pd.read_csv(input_path)
    n = len(df)

    # Реалистичные РФ-цены (курс 25 ₽/USD + шум)
    monthly_rub = (
        df["MonthlyCharges"].fillna(0) * 25
        + np.random.normal(0, 30, size=n)
    ).round().clip(200, 3500).astype(int)

    total_rub = (
        df["TotalCharges"].replace(" ", np.nan).astype(float).fillna(0) * 25
        + np.random.normal(0, 100, size=n)
    ).round().clip(0, None).astype(int)

    service_cols = [
        "PhoneService", "MultipleLines", "InternetService",
        "OnlineSecurity", "OnlineBackup", "DeviceProtection",
        "TechSupport", "StreamingTV", "StreamingMovies",
    ]
    num_services = df[service_cols].apply(
        lambda row: sum(YN.get(str(v), 0) if isinstance(v, str) else int(v) for v in row),
        axis=1,
    )

    arpu = (monthly_rub / num_services.replace(0, 1)).round(1)

    regions = np.random.choice(list(REGIONS.keys()), size=n, p=list(REGIONS.values()))
    age = np.clip(np.random.normal(38, 13, n), 18, 80).round().astype(int)
    pensioner = (age >= 65).astype(int)
    children = np.random.choice([0, 1], size=n, p=[0.60, 0.40])
    traffic_gb = np.clip(
        np.random.normal(12 + num_services.values * 4, 8, n), 1, 100
    ).round().astype(int)
    delays = np.clip(
        np.random.poisson(
            np.where(df["PaymentMethod"] == "Bank transfer (automatic)", 0.4, 1.5), n
        ), 0, 15,
    ).astype(int)
    complaints = np.clip(
        np.random.poisson(
            np.where(df["Contract"] == "Two year", 0.3, 1.0), n
        ), 0, 10,
    ).astype(int)

    churn = (df["Churn"] == "Yes").astype(int)

    out = pd.DataFrame({
        "id_клиента": df["customerID"],
        "пол": df["gender"].map(GENDER_MAP),
        "возраст": age,
        "пенсионер": pensioner,
        "семейное_положение": df["Partner"].map(PARTNER_MAP),
        "дети": df["Dependents"].map(YN),
        "регион": regions,
        "тариф": monthly_rub.apply(tariff_from_price),
        "тип_договора": df["Contract"].map(CONTRACT_MAP),
        "способ_оплаты": df["PaymentMethod"].map(PAYMENT_MAP),
        "стаж_месяцев": df["tenure"].astype(int),
        "ежемесячный_платёж_руб": monthly_rub,
        "суммарные_платежи_руб": total_rub,
        "arpu_руб": arpu,
        "количество_услуг": num_services,
        "домашний_интернет": df["InternetService"].map(INTERNET_MAP).isin(["ADSL", "GPON"]).astype(int),
        "технология_интернета": df["InternetService"].map(INTERNET_MAP),
        "тв": df["StreamingTV"].map(YN),
        "антивирус": df["OnlineSecurity"].map(YN),
        "облако": df["OnlineBackup"].map(YN),
        "средний_трафик_гб": traffic_gb,
        "просрочки_платежей_12мес": delays,
        "жалобы_12мес": complaints,
        "отток": churn,
    })

    out.to_csv(output_path, index=False, encoding="utf-8")
    print(f"✅ {output_path}: {len(out)} строк, {len(out.columns)} колонок")
    print(f"Churn rate: {out['отток'].mean():.2%}")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Использование: python convert_to_russia.py <путь_к_CSV>")
        sys.exit(1)
    convert(sys.argv[1], "churn_ru.csv")