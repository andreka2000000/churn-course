import io, sys, runpy
from fastapi.testclient import TestClient

def test_api_works():
    # 1. Загружаем решение (там создается app)
    res = runpy.run_path('/workspace/solution.py')
    app = res.get('app')
    assert app is not None, "В коде не создано приложение 'app'"

    # 2. Создаем клиент и делаем запросы
    test_client = TestClient(app)
    
    resp1 = test_client.post("/predict", json={
        "стаж_месяцев": 60,
        "жалобы_12мес": 0,
        "просрочки_платежей_12мес": 0,
        "ежемесячный_платёж_руб": 800,
    })
    assert resp1.status_code == 200, "Тест 1 упал с ошибкой"
    assert resp1.json()["will_churn"] == False, "Лояльный клиент не должен уходить"

    resp2 = test_client.post("/predict", json={
        "стаж_месяцев": 3,
        "жалобы_12мес": 5,
        "просрочки_платежей_12мес": 4,
        "ежемесячный_платёж_руб": 500,
    })
    assert resp2.status_code == 200, "Тест 2 упал с ошибкой"
    assert resp2.json()["will_churn"] == True, "Проблемный клиент должен уходить"

    resp3 = test_client.post("/predict", json={
        "стаж_месяцев": -5,
        "жалобы_12мес": 0,
        "просрочки_платежей_12мес": 0,
        "ежемесячный_платёж_руб": 500,
    })
    assert resp3.status_code == 422, "Невалидные данные должны давать 422 ошибку"