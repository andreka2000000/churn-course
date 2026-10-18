from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from fastapi.testclient import TestClient
import pandas as pd

app = FastAPI(title="Churn Predictor")

# 1. Схема входных данных
class ClientData(BaseModel):
    стаж_месяцев: int = Field(ge=0, le=120)
    жалобы_12мес: int = Field(ge=0, le=20)
    просрочки_платежей_12мес: int = Field(ge=0, le=20)
    ежемесячный_платёж_руб: int = Field(ge=0, le=10000)

class PredictionResponse(BaseModel):
    probability: float
    will_churn: bool

# 2. Эндпоинт
@app.post("/predict", response_model=PredictionResponse)
def predict(client: ClientData):
    # Имитируем модель для демонстрации
    # В реальности здесь был бы joblib.load('best_model.pkl').predict_proba(...)
    base = 0.3
    base += 0.1 * client.жалобы_12мес
    base += 0.15 * client.просрочки_платежей_12мес
    base -= 0.01 * (client.стаж_месяцев / 12)

    prob = min(max(base, 0.0), 1.0)

    return PredictionResponse(
        probability=round(prob, 4),
        will_churn=prob > 0.5
    )

# 3. Тест через TestClient (без запуска сервера)
if __name__ == "__main__":
    test_client = TestClient(app)

    # Тест 1: лояльный клиент
    resp1 = test_client.post("/predict", json={
        "стаж_месяцев": 60,
        "жалобы_12мес": 0,
        "просрочки_платежей_12мес": 0,
        "ежемесячный_платёж_руб": 800,
    })
    print(f"Тест 1 (лояльный): {resp1.json()}")

    # Тест 2: проблемный клиент
    resp2 = test_client.post("/predict", json={
        "стаж_месяцев": 3,
        "жалобы_12мес": 5,
        "просрочки_платежей_12мес": 4,
        "ежемесячный_платёж_руб": 500,
    })
    print(f"Тест 2 (проблемный): {resp2.json()}")

    # Тест 3: некорректные данные (отрицательный стаж)
    resp3 = test_client.post("/predict", json={
        "стаж_месяцев": -5,
        "жалобы_12мес": 0,
        "просрочки_платежей_12мес": 0,
        "ежемесячный_платёж_руб": 500,
    })
    print(f"Тест 3 (невалидные данные, статус {resp3.status_code})")