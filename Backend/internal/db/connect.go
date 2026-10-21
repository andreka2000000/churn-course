package db

import (
	"log"
	"time"

	"churn-course/backend/internal/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func Connect(databaseURL string) {
	var err error
	maxRetries := 10

	for i := 1; i <= maxRetries; i++ {
		DB, err = gorm.Open(postgres.Open(databaseURL), &gorm.Config{
			Logger: logger.Default.LogMode(logger.Warn),
		})
		if err == nil {
			log.Println("✅ Подключение к PostgreSQL установлено")
			return
		}

		log.Printf("⏳ Ожидание базы данных... (попытка %d/%d)", i, maxRetries)
		time.Sleep(2 * time.Second)
	}

	log.Fatalf("❌ Не удалось подключиться к БД после %d попыток: %v", maxRetries, err)
}

func AutoMigrate() {
	err := DB.AutoMigrate(
		&models.User{},
		&models.Module{},
		&models.Lesson{},
		&models.Task{},
		&models.Submission{},
		&models.Progress{},
	)
	if err != nil {
		log.Fatalf("❌ Ошибка миграции: %v", err)
	}

	log.Println("✅ Таблицы созданы/обновлены")
}
