package db

import (
	"log"

	"churn-course/backend/internal/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func Connect(databaseURL string) {
	var err error

	DB, err = gorm.Open(postgres.Open(databaseURL), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Warn),
	})
	if err != nil {
		log.Fatalf("❌ Не удалось подключиться к БД: %v", err)
	}

	log.Println("✅ Подключение к PostgreSQL установлено")
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
