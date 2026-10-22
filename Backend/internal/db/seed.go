package db

import (
	"crypto/rand"
	"fmt"
	"log"
	"math/big"
	"os"
	"path/filepath"
	"strings"

	"churn-course/backend/internal/auth"
	"churn-course/backend/internal/models"
)

// generateSecurePassword создает случайный пароль из 12 символов (буквы и цифры)
func generateSecurePassword() string {
	const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	result := make([]byte, 12)
	for i := range result {
		num, _ := rand.Int(rand.Reader, big.NewInt(int64(len(chars))))
		result[i] = chars[num.Int64()]
	}
	return string(result)
}

// Seed — читает файлы из папки content/ и наполняет БД.
func Seed() {
	// 1. Создаем администратора (если его еще нет)
	var adminUser models.User
	if err := DB.Where("email = ?", "admin@churn.ru").First(&adminUser).Error; err != nil {
		adminPassword := os.Getenv("ADMIN_PASSWORD")
		if adminPassword == "" {
			adminPassword = generateSecurePassword()
			log.Println("=========================================================")
			log.Println("🔐 СОЗДАН АККАУНТ АДМИНИСТРАТОРА!")
			log.Println("   Логин:  admin@churn.ru")
			log.Println("   Пароль:", adminPassword)
			log.Println("   ВНИМАНИЕ: Сохраните этот пароль, он больше не появится!")
			log.Println("=========================================================")
		}

		hash, err := auth.HashPassword(adminPassword)
		if err != nil {
			log.Fatalf("❌ Ошибка хеширования пароля админа: %v", err)
		}

		adminUser = models.User{
			Email:        "admin@churn.ru",
			Username:     "Администратор",
			PasswordHash: hash,
			IsAdmin:      true,
			IsVerified:   true,
		}
		DB.Create(&adminUser)
	}

	// 2. Проверяем, есть ли уже модули (чтобы не дублировать)
	var count int64
	DB.Model(&models.Module{}).Count(&count)
	if count > 0 {
		log.Println("ℹ️  БД уже содержит данные, seed модулей пропущен")
		return
	}

	log.Println("⏳ Начинаем наполнение БД из папки content/...")

	contentDir := "/content"

	for m := 1; m <= 4; m++ {
		moduleTitle := getModuleTitle(m)

		module := models.Module{
			Title:       moduleTitle,
			Description: fmt.Sprintf("Материалы модуля %d курса.", m),
			Order:       m,
		}

		for l := 1; l <= 5; l++ {
			lessonPath := filepath.Join(contentDir, fmt.Sprintf("module%d", m), fmt.Sprintf("lesson%d", l))

			theoryPath := filepath.Join(lessonPath, "theory.md")
			starterPath := filepath.Join(lessonPath, "starter.py")
			testPath := filepath.Join(lessonPath, "test.py")

			theory, err1 := os.ReadFile(theoryPath)
			starter, err2 := os.ReadFile(starterPath)
			testScript, err3 := os.ReadFile(testPath)

			if err1 != nil || err2 != nil || err3 != nil {
				log.Printf("⚠️  Пропущен урок %d.%d (не найдены все 3 файла)\n", m, l)
				continue
			}

			lessonTitle := extractTitle(string(theory))
			if lessonTitle == "" {
				lessonTitle = fmt.Sprintf("Урок %d.%d", m, l)
			}

			lesson := models.Lesson{
				Title:       lessonTitle,
				Order:       l,
				TheoryMD:    string(theory),
				StarterCode: string(starter),
				Task: models.Task{
					Description: "Выполните задание, описанное в теории, и напишите код.",
					Hint:        "Прочитайте теорию внимательно.",
					CheckScript: string(testScript),
					MaxScore:    10,
				},
			}

			module.Lessons = append(module.Lessons, lesson)
		}

		if err := DB.Create(&module).Error; err != nil {
			log.Fatalf("❌ Ошибка seed модуля %d: %v", m, err)
		}
		log.Printf("✅ Модуль %d создан (%d уроков)\n", m, len(module.Lessons))
	}

	log.Println("🎉 Наполнение БД успешно завершено!")
}

func extractTitle(theory string) string {
	lines := strings.Split(theory, "\n")
	for _, line := range lines {
		line = strings.TrimSpace(line)
		if strings.HasPrefix(line, "# ") {
			title := strings.TrimPrefix(line, "# ")
			title = strings.ReplaceAll(title, "**", "")
			return title
		}
	}
	return ""
}

func getModuleTitle(m int) string {
	titles := map[int]string{
		1: "Зачем телекому прогнозировать отток",
		2: "Подготовка данных и признаки",
		3: "Модели и метрики",
		4: "Интерпретация и внедрение",
	}
	if title, ok := titles[m]; ok {
		return title
	}
	return fmt.Sprintf("Модуль %d", m)
}
