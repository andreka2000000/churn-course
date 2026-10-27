package main

import (
	"log"
	"net/http"
	"os"
	"strings"

	"churn-course/backend/internal/db"
	"churn-course/backend/internal/handlers"
	"churn-course/backend/internal/middleware"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("⚠️  .env не найден, используем переменные окружения")
	}

	db.Connect(os.Getenv("DATABASE_URL"))
	db.AutoMigrate()
	db.Seed()

	r := gin.Default()
	_ = r.SetTrustedProxies(nil)
	r.Use(corsMiddleware())

	r.GET("/ping", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok", "message": "Backend is running"})
	})

	api := r.Group("/api/v1")
	{
		api.GET("/health", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{"db": "connected"})
		})

		authGroup := api.Group("/auth")
		{
			authGroup.POST("/register", handlers.Register)
			authGroup.POST("/login", handlers.Login)
			authGroup.GET("/verify", handlers.VerifyEmail)
			authGroup.POST("/resend-verification", handlers.ResendVerification)
		}

		protected := api.Group("")
		protected.Use(middleware.RequireAuth())
		{
			protected.GET("/auth/me", handlers.Me)
			protected.GET("/courses/:id", handlers.GetCourse)
			protected.GET("/lessons/:id", handlers.GetLesson)
			protected.GET("/progress", handlers.GetProgress)
			protected.POST("/run", handlers.Run)
			protected.POST("/submit", handlers.Submit)
			protected.GET("/admin/users", handlers.GetUsers)
		}
	}

	port := os.Getenv("SERVER_PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("🚀 Сервер запущен на http://localhost:%s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("❌ Ошибка сервера: %v", err)
	}
}

func corsMiddleware() gin.HandlerFunc {
	allowed := map[string]bool{
		"http://localhost:5173": true,
		"http://localhost":      true,
	}
	if env := os.Getenv("CORS_ORIGINS"); env != "" {
		for _, o := range strings.Split(env, ",") {
			allowed[strings.TrimSpace(o)] = true
		}
	}

	return func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")
		if allowed[origin] {
			c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
		}
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}
		c.Next()
	}
}
