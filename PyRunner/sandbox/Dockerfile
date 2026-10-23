FROM python:3.11-slim

# ML-стек для курса + FastAPI для деплоя
RUN pip install --no-cache-dir \
    pandas==2.1.4 \
    numpy==1.26.4 \
    scikit-learn==1.4.2 \
    xgboost==2.0.3 \
    lightgbm==4.3.0 \
    catboost==1.2.5 \
    shap==0.45.0 \
    matplotlib==3.8.4 \
    seaborn==0.13.2 \
    imbalanced-learn==0.12.2 \
    fastapi==0.110.0 \
    uvicorn==0.27.1 \
    requests==2.31.0 \
    pytest==8.2.0 \
    httpx==0.27.0

WORKDIR /workspace