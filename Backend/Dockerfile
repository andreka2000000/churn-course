# Этап сборки
FROM golang:1.26-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN go build -o main cmd/server/main.go

# Этап запуска
FROM alpine:latest
WORKDIR /app
# Копируем бинарник и папку content (так как Seed читает её)
COPY --from=builder /app/main .
COPY --from=builder /content /content
EXPOSE 8080
CMD ["./main"]