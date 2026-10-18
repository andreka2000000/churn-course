package handlers

import (
	"net/http"
	"time"

	"churn-course/backend/internal/db"
	"churn-course/backend/internal/models"
	"churn-course/backend/internal/runner"

	"github.com/gin-gonic/gin"
)

type RunInput struct {
	LessonID uint   `json:"lesson_id" binding:"required"`
	Code     string `json:"code" binding:"required"`
}

// Run — POST /api/v1/run
// Просто выполняет код, ничего не сохраняет
func Run(c *gin.Context) {
	var input RunInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	start := time.Now()
	result, err := runner.Execute(runner.ExecRequest{
		Code:    input.Code,
		Timeout: 30,
	})
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"stdout":      result.Stdout,
		"stderr":      result.Stderr,
		"exit_code":   result.ExitCode,
		"duration_ms": time.Since(start).Milliseconds(),
		"files":       result.Files,
	})
}

// Submit — POST /api/v1/submit
// Прогоняет код против тестов задачи и сохраняет результат
func Submit(c *gin.Context) {
	var input RunInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userIDVal, _ := c.Get("user_id")
	userID, _ := userIDVal.(uint)

	// Достаём задачу для урока
	var task models.Task
	if err := db.DB.
		Joins("JOIN lessons ON lessons.id = tasks.lesson_id").
		Where("lessons.id = ?", input.LessonID).
		First(&task).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Задание для урока не найдено"})
		return
	}

	// Отправляем в PyRunner с тестовым скриптом
	start := time.Now()
	result, err := runner.Execute(runner.ExecRequest{
		Code:     input.Code,
		TestCode: task.CheckScript,
		Timeout:  30,
	})
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": err.Error()})
		return
	}

	// Считаем score
	score := 0
	if result.Passed {
		score = task.MaxScore
	}

	// Сохраняем submission
	submission := models.Submission{
		UserID: userID,
		TaskID: task.ID,
		Code:   input.Code,
		Passed: result.Passed,
		Score:  score,
		Output: result.Stdout + "\n" + result.Stderr,
	}
	db.DB.Create(&submission)

	// Обновляем прогресс
	var progress models.Progress
	err = db.DB.Where("user_id = ? AND lesson_id = ?", userID, input.LessonID).First(&progress).Error
	if err != nil {
		// не было — создаём
		progress = models.Progress{
			UserID:    userID,
			LessonID:  input.LessonID,
			Completed: result.Passed,
			Score:     score,
		}
		db.DB.Create(&progress)
	} else {
		// было — обновляем (если улучшилось)
		if result.Passed && !progress.Completed {
			progress.Completed = true
		}
		if score > progress.Score {
			progress.Score = score
		}
		db.DB.Save(&progress)
	}

	// Формируем ответ для фронта
	tests := make([]gin.H, 0, len(result.Tests))
	for _, t := range result.Tests {
		tests = append(tests, gin.H{
			"name":    t.Name,
			"passed":  t.Passed,
			"message": t.Message,
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"stdout":      result.Stdout,
		"stderr":      result.Stderr,
		"exit_code":   result.ExitCode,
		"duration_ms": time.Since(start).Milliseconds(),
		"files":       result.Files,
		"passed":      result.Passed,
		"score":       score,
		"max_score":   task.MaxScore,
		"tests":       tests,
	})
}
