package handlers

import (
	"churn-course/backend/internal/db"
	"churn-course/backend/internal/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetUsers(c *gin.Context) {
	var users []models.User
	if err := db.DB.Find(&users).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка загрузки пользователей"})
		return
	}
	c.JSON(http.StatusOK, users)
}
