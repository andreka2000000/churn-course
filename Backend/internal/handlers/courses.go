package handlers

import (
	"net/http"

	"churn-course/backend/internal/db"
	"churn-course/backend/internal/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// GetCourse — GET /api/v1/courses/:id
// GetCourse — GET /api/v1/courses/:id
func GetCourse(c *gin.Context) {
	userID, _ := c.Get("user_id")

	// Проверяем, админ ли пользователь
	isAdmin := false
	if userID != nil {
		var currentUser models.User
		if err := db.DB.First(&currentUser, userID).Error; err == nil {
			isAdmin = currentUser.IsAdmin
		}
	}

	var modules []models.Module
	if err := db.DB.
		Preload("Lessons", func(tx *gorm.DB) *gorm.DB {
			return tx.Order("lessons.\"order\" ASC")
		}).
		Order("\"order\" ASC").
		Find(&modules).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка загрузки курса"})
		return
	}

	var lessonIDs []uint
	for _, m := range modules {
		for _, l := range m.Lessons {
			lessonIDs = append(lessonIDs, l.ID)
		}
	}

	completedMap := map[uint]bool{}
	if userID != nil && len(lessonIDs) > 0 {
		var progresses []models.Progress
		db.DB.Where("user_id = ? AND lesson_id IN ?", userID, lessonIDs).Find(&progresses)
		for _, p := range progresses {
			completedMap[p.LessonID] = p.Completed
		}
	}

	type LessonSummary struct {
		ID        uint   `json:"id"`
		Title     string `json:"title"`
		Order     int    `json:"order"`
		Completed bool   `json:"completed"`
		Unlocked  bool   `json:"unlocked"`
	}
	type ModuleResponse struct {
		ID      uint            `json:"id"`
		Title   string          `json:"title"`
		Order   int             `json:"order"`
		Lessons []LessonSummary `json:"lessons"`
	}

	resp := make([]ModuleResponse, 0, len(modules))
	canUnlockNext := true

	for _, m := range modules {
		lessons := make([]LessonSummary, 0, len(m.Lessons))
		for _, l := range m.Lessons {
			// АДМИНУ ДОСТУПНО ВСЁ
			unlocked := isAdmin || canUnlockNext || completedMap[l.ID]

			lessons = append(lessons, LessonSummary{
				ID:        l.ID,
				Title:     l.Title,
				Order:     l.Order,
				Completed: completedMap[l.ID],
				Unlocked:  unlocked,
			})

			canUnlockNext = completedMap[l.ID]
		}
		resp = append(resp, ModuleResponse{
			ID:      m.ID,
			Title:   m.Title,
			Order:   m.Order,
			Lessons: lessons,
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"id":          1,
		"title":       "Прогноз оттока клиентов телеком-оператора",
		"description": "Курс для конкурса Учи IT. 4 модуля, 20 уроков, ML-проект от идеи до питча.",
		"modules":     resp,
	})
}

// GetLesson — GET /api/v1/lessons/:id
func GetLesson(c *gin.Context) {
	lessonID := c.Param("id")
	userID, _ := c.Get("user_id")

	var lesson models.Lesson
	if err := db.DB.
		Preload("Task").
		First(&lesson, lessonID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Урок не найден"})
		return
	}

	// Проверяем, разблокирован ли урок
	// Урок открыт, если это самый первый урок, либо если предыдущий успешно пройден.
	// Проверяем, является ли пользователь админом
	isAdmin := false
	if userID != nil {
		var currentUser models.User
		if err := db.DB.First(&currentUser, userID).Error; err == nil {
			isAdmin = currentUser.IsAdmin
		}
	}

	// Проверяем, разблокирован ли урок
	var totalPrev int64
	db.DB.Model(&models.Lesson{}).Where("id < ?", lesson.ID).Count(&totalPrev)

	if !isAdmin && totalPrev > 0 { // Если не админ и не первый урок
		var prevLesson models.Lesson
		if err := db.DB.Where("id < ?", lesson.ID).Order("id DESC").First(&prevLesson).Error; err == nil {
			var prevProgress models.Progress
			if userID != nil {
				db.DB.Where("user_id = ? AND lesson_id = ?", userID, prevLesson.ID).First(&prevProgress)
				if !prevProgress.Completed {
					c.JSON(http.StatusForbidden, gin.H{"error": "Сначала пройдите предыдущий урок"})
					return
				}
			}
		}
	}

	completed := false
	if userID != nil {
		var p models.Progress
		if err := db.DB.Where("user_id = ? AND lesson_id = ?", userID, lesson.ID).First(&p).Error; err == nil {
			completed = p.Completed
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"id":           lesson.ID,
		"module_id":    lesson.ModuleID,
		"title":        lesson.Title,
		"order":        lesson.Order,
		"theory_md":    lesson.TheoryMD,
		"starter_code": lesson.StarterCode,
		"completed":    completed,
		"task": gin.H{
			"id":          lesson.Task.ID,
			"description": lesson.Task.Description,
			"hint":        lesson.Task.Hint,
			"max_score":   lesson.Task.MaxScore,
		},
	})
}

// GetProgress — GET /api/v1/progress
func GetProgress(c *gin.Context) {
	userID, _ := c.Get("user_id")

	var totalLessons int64
	db.DB.Model(&models.Lesson{}).Count(&totalLessons)

	var completedLessons int64
	db.DB.Model(&models.Progress{}).
		Where("user_id = ? AND completed = ?", userID, true).
		Count(&completedLessons)

	var totalScore int
	db.DB.Model(&models.Progress{}).
		Where("user_id = ?", userID).
		Select("COALESCE(SUM(score), 0)").
		Scan(&totalScore)

	var maxScore int
	db.DB.Model(&models.Task{}).
		Select("COALESCE(SUM(max_score), 0)").
		Scan(&maxScore)

	c.JSON(http.StatusOK, gin.H{
		"total_lessons":     totalLessons,
		"completed_lessons": completedLessons,
		"score":             totalScore,
		"max_score":         maxScore,
	})
}
