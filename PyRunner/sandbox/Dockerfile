FROM python:3.11-slim

# ML-стек для курса
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
    pytest==8.2.0

WORKDIR /workspace