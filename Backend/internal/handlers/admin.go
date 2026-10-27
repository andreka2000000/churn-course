package handlers

import (
	"churn-course/backend/internal/db"
	"churn-course/backend/internal/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

// AdminUser — пользователь + агрегированный прогресс для админки
type AdminUser struct {
	models.User
	CompletedLessons int `json:"completed_lessons"`
	TotalScore       int `json:"total_score"`
}

func GetUsers(c *gin.Context) {
	var users []AdminUser

	err := db.DB.
		Table("users").
		Select(`
			users.*,
			COALESCE(SUM(CASE WHEN progresses.completed THEN 1 ELSE 0 END), 0) AS completed_lessons,
			COALESCE(SUM(progresses.score), 0) AS total_score
		`).
		Joins("LEFT JOIN progresses ON progresses.user_id = users.id").
		Group("users.id").
		Order("users.id ASC").
		Scan(&users).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка загрузки пользователей"})
		return
	}
	c.JSON(http.StatusOK, users)
}
