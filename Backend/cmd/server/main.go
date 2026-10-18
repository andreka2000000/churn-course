package main

import (
	"log"
	"net/http"
	"os"

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
	r.Use(corsMiddleware())

	r.GET("/ping", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok", "message": "Backend is running"})
	})

	api := r.Group("/api/v1")
	{
		// health
		api.GET("/health", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{"db": "connected"})
		})

		// auth — публичные
		authGroup := api.Group("/auth")
		{
			authGroup.POST("/register", handlers.Register)
			authGroup.POST("/login", handlers.Login)
		}

		// защищённые
		protected := api.Group("")
		protected.Use(middleware.RequireAuth())
		{
			protected.GET("/auth/me", handlers.Me)
			protected.GET("/courses/:id", handlers.GetCourse)
			protected.GET("/lessons/:id", handlers.GetLesson)
			protected.GET("/progress", handlers.GetProgress)
			protected.POST("/run", handlers.Run)       // ← новая
			protected.POST("/submit", handlers.Submit) // ← новая
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
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "http://localhost:5173")
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
