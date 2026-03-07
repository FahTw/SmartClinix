package main

import (
	"auth/config"
	"auth/database"
	"auth/handler"
	"auth/middleware"
	"auth/model"
	"auth/repository"
	"log"

	"github.com/gin-gonic/gin"
)

func main() {
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatalf("failed to load config: %v", err)
	}

	db, err := database.NewPostgresConnection(cfg)
	if err != nil {
		log.Fatalf("failed to connect to database: %v", err)
	}

	if err := db.AutoMigrate(&model.User{}); err != nil {
		log.Fatalf("failed to auto migrate: %v", err)
	}
	db.AutoMigrate(&model.User{})

	repo := repository.NewAuthRepository(db, cfg.JWTSecret)
	authHandler := handler.NewAuthHandler(repo)

	r := gin.Default()

	authGroup := r.Group("/auth")
	{
		authGroup.POST("/register", authHandler.Register)
		authGroup.POST("/login", authHandler.Login)

		protected := authGroup.Group("")
		protected.Use(middleware.RequireAuth())
		protected.GET("/me", authHandler.Me)
	}

	log.Printf("Auth Service running on port 8082")
	if err := r.Run(":8082"); err != nil {
		log.Fatalf("server failed: %v", err)
	}
}
