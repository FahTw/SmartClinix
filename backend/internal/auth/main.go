package main

import (

	"log"

	"github.com/gin-gonic/gin"
)

func main() {
	// 1. โหลด Config
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	// 2. เชื่อมต่อ DB
	db, err := database.NewPostgresConnection(cfg)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// 3. Auto Migrate

	// 4. เริ่มใช้งาน Repository

	// 5. เริ่มใช้งาน Handler (โยน Repo ให้ Handler)

	// 6. ตั้งค่า Gin Router
	r := gin.Default()

	// ผูกเส้นทางไปที่ Handler

	// 7. รัน Server
	log.Printf("🚀 Auth Service running on port %s", cfg.Server.Port)
	r.Run(":" + cfg.Server.Port)
}