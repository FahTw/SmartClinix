package main

import (
	"log"
	"medical_records/config"
	"medical_records/database"
	"medical_records/handler"
	"medical_records/model"
	"medical_records/repository"

	"github.com/gin-gonic/gin"
)

func main() {
	// 1. โหลด Config จาก Environment Variables
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}
	db, err := database.NewPostgresConnection(cfg)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	db.AutoMigrate(&model.MedicalRecord{})

	medicalRecordRepo := repository.NewMedicalRecordRepository(db)

	medicalRecordHandler := handler.NewMedicalRecordHandler(medicalRecordRepo)
	r := gin.Default()
	r.POST("/medical_records", medicalRecordHandler.Create)
	r.GET("/medical_records", medicalRecordHandler.GetAll)
	r.GET("/medical_records/:id", medicalRecordHandler.GetByID)
	r.PUT("/medical_records/:id", medicalRecordHandler.Update)
	r.DELETE("/medical_records/:id", medicalRecordHandler.Delete)

	log.Printf("🚀 Medical Records Service running on port %s", cfg.Server.Port)
	r.Run(":" + cfg.Server.Port)
}
