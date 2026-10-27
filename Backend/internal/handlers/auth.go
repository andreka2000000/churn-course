package handlers

import (
	"fmt"
	"net/http"
	"os"
	"strings"

	"churn-course/backend/internal/auth"
	"churn-course/backend/internal/db"
	"churn-course/backend/internal/models"

	"github.com/gin-gonic/gin"
)

type RegisterInput struct {
	Email    string `json:"email" binding:"required,email"`
	Username string `json:"username" binding:"required,min=2,max=100"`
	Password string `json:"password" binding:"required,min=6"`
}

type LoginInput struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type ResendInput struct {
	Email string `json:"email" binding:"required,email"`
}

type AuthResponse struct {
	Token string      `json:"token"`
	User  models.User `json:"user"`
}

// verifyURL — собирает ссылку подтверждения (для теста/локалки)
func verifyURL(email string) string {
	base := os.Getenv("PUBLIC_BASE_URL")
	if base == "" {
		base = "http://localhost:8080"
	}
	return fmt.Sprintf("%s/api/v1/auth/verify?email=%s", base, email)
}

// Register — POST /api/v1/auth/register
func Register(c *gin.Context) {
	var input RegisterInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	input.Email = strings.ToLower(strings.TrimSpace(input.Email))
	input.Username = strings.TrimSpace(input.Username)

	var existing models.User
	if err := db.DB.Where("email = ?", input.Email).First(&existing).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Пользователь с таким email уже существует"})
		return
	}

	hash, err := auth.HashPassword(input.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка хеширования пароля"})
		return
	}

	user := models.User{
		Email:        input.Email,
		Username:     input.Username,
		PasswordHash: hash,
		IsVerified:   false,
	}

	if err := db.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось создать пользователя"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":    "Аккаунт создан. Пожалуйста, подтвердите вашу почту.",
		"verify_url": verifyURL(input.Email),
	})
}

// Login — POST /api/v1/auth/login
func Login(c *gin.Context) {
	var input LoginInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	input.Email = strings.ToLower(strings.TrimSpace(input.Email))

	var user models.User
	if err := db.DB.Where("email = ?", input.Email).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Неверный email или пароль"})
		return
	}

	if !auth.CheckPassword(input.Password, user.PasswordHash) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Неверный email или пароль"})
		return
	}

	// Если почта не подтверждена — отдаём verify_url, чтобы фронт мог показать ссылку
	if !user.IsVerified && !user.IsAdmin {
		c.JSON(http.StatusForbidden, gin.H{
			"error":      "Пожалуйста, подтвердите вашу почту перед входом.",
			"code":       "email_not_verified",
			"verify_url": verifyURL(user.Email),
		})
		return
	}

	token, err := auth.GenerateToken(user.ID, user.Email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка генерации токена"})
		return
	}

	c.JSON(http.StatusOK, AuthResponse{Token: token, User: user})
}

// ResendVerification — POST /api/v1/auth/resend-verification
// Принимает email, возвращает ссылку подтверждения (если юзер существует и не подтверждён).
func ResendVerification(c *gin.Context) {
	var input ResendInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	input.Email = strings.ToLower(strings.TrimSpace(input.Email))

	var user models.User
	if err := db.DB.Where("email = ?", input.Email).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Пользователь не найден"})
		return
	}

	if user.IsVerified {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Почта уже подтверждена"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":    "Ссылка подтверждения сгенерирована заново.",
		"verify_url": verifyURL(user.Email),
	})
}

// VerifyEmail — GET /api/v1/auth/verify?email=...
func VerifyEmail(c *gin.Context) {
	email := c.Query("email")
	if email == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email не указан"})
		return
	}

	var user models.User
	if err := db.DB.Where("email = ?", email).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Пользователь не найден"})
		return
	}

	db.DB.Model(&user).Update("is_verified", true)
	c.JSON(http.StatusOK, gin.H{"message": "Почта успешно подтверждена! Теперь вы можете войти."})
}

// Me — GET /api/v1/auth/me (защищённый)
func Me(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Не авторизован"})
		return
	}

	var user models.User
	if err := db.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Пользователь не найден"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"user": user})
}
