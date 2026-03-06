package main

import (
	"appointment/config"
	"appointment/database"
	"appointment/handler"
	"appointment/model"
	"appointment/repository"
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
	db.AutoMigrate(&model.Appointment{})

	// 4. เริ่มใช้งาน Repository
	apptRepo := repository.NewAppointmentRepository(db)

	// 5. เริ่มใช้งาน Handler (โยน Repo ให้ Handler)
	apptHandler := handler.NewAppointmentHandler(apptRepo)

	// 6. ตั้งค่า Gin Router
	r := gin.Default()

	// ผูกเส้นทางไปที่ Handler
	r.POST("/appointments", apptHandler.Create)
	r.PUT("/appointments/:id", apptHandler.Update)

	// 7. รัน Server
	log.Printf("🚀 Appointment Service running on port %s", cfg.Server.Port)
	r.Run(":" + cfg.Server.Port)
}