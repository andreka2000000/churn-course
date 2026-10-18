# Учи IT — Прогноз оттока клиентов телеком-оператора

Образовательная платформа для обучения Data Science. В курсе 4 модуля по 5 уроков, посвящённых полному циклу ML-проекта: от EDA до деплоя модели прогноза оттока клиентов телеком-оператора.

## Стек технологий

- Фронтенд: React 18 + TypeScript, Vite, Tailwind CSS, Monaco Editor (VS Code в браузере)
- Бэкенд: Go (Gin, GORM)
- База данных: PostgreSQL 16
- Python Runner: FastAPI + Docker (безопасная песочница для запуска кода студентов)
- ML: Scikit-learn, XGBoost, CatBoost, SHAP

## Как запустить локально (вариант 1: Docker)

Это самый простой способ, вам не нужно устанавливать Go или Node.js. Достаточно только Docker Desktop.

1. Клонируйте репозиторий.
2. В корне проекта выполните команду: 
   docker compose up -d --build
3. Откройте в браузере: http://localhost (порт 80).

Внимание: для работы Python-песочницы в Docker необходимо, чтобы локально был собран образ churn-sandbox:latest. Если его нет, выполните: 
docker build -t churn-sandbox:latest -f PyRunner/sandbox/Dockerfile PyRunner/sandbox/

## Как запустить локально (вариант 2: без Docker)

1. База данных: cd backend && docker compose up -d
2. Python Runner: cd PyRunner && docker compose up -d --build
3. Бэкенд: cd backend && go run cmd/server/main.go
4. Фронтенд: cd frontend && npm install && npm run dev

## Структура проекта

- frontend/ — React-интерфейс
- backend/ — Go API
- PyRunner/ — Python-сервис для проверки кода в песочнице
- content/ — Markdown-теория, стартовый код и тесты для 20 уроков