package db

import (
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strings"

	"churn-course/backend/internal/models"
)

// Seed — читает файлы из папки content/ и наполняет БД.
// Если БД уже содержит модули, seed пропускается.
func Seed() {
	var count int64
	DB.Model(&models.Module{}).Count(&count)
	if count > 0 {
		log.Println("ℹ️  БД уже содержит данные, seed пропущен")
		return
	}

	log.Println("⏳ Начинаем наполнение БД из папки content/...")

	// Корневая папка с контентом (предполагаем, что бэкенд запускается из папки backend)
	contentDir := "/content"

	for m := 1; m <= 4; m++ {
		// Читаем название модуля из файла, если он есть, иначе ставим дефолтное
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

			// Проверяем, что файлы существуют
			theory, err1 := os.ReadFile(theoryPath)
			starter, err2 := os.ReadFile(starterPath)
			testScript, err3 := os.ReadFile(testPath)

			if err1 != nil || err2 != nil || err3 != nil {
				log.Printf("⚠️  Пропущен урок %d.%d (не найдены все 3 файла)\n", m, l)
				continue
			}

			// Вытаскиваем заголовок урока из теории (первая строка с #)
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

		// Сохраняем модуль (GORM каскадно сохранит и уроки, и задачи)
		if err := DB.Create(&module).Error; err != nil {
			log.Fatalf("❌ Ошибка seed модуля %d: %v", m, err)
		}
		log.Printf("✅ Модуль %d создан (%d уроков)\n", m, len(module.Lessons))
	}

	log.Println("🎉 Наполнение БД успешно завершено!")
}

// extractTitle ищет первую строку, начинающуюся с "# ", и возвращает текст без решётки.
func extractTitle(theory string) string {
	lines := strings.Split(theory, "\n")
	for _, line := range lines {
		line = strings.TrimSpace(line)
		if strings.HasPrefix(line, "# ") {
			// Убираем "# " и возможное "Урок X.X — " в начале
			title := strings.TrimPrefix(line, "# ")
			title = strings.ReplaceAll(title, "**", "") // Убираем жирный шрифт, если есть
			return title
		}
	}
	return ""
}

// getModuleTitle возвращает название модуля по его номеру
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
