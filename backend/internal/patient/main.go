package main

import (
	"fmt"
	"log"
	"net/http"
	"patient/config"
	"patient/database"
	"patient/model"
	"patient/repository"

	"github.com/gin-gonic/gin"
)

func main() {
	// 1. โหลด Config จาก Environment Variables
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	// 2. เชื่อมต่อ PostgreSQL อย่างปลอดภัย
	db, err := database.NewPostgresConnection(cfg)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// 2. Auto Migrate
	db.AutoMigrate(&model.Patient{})

	// 3. เริ่มใช้งาน Repository
	patientRepo := repository.NewPatientRepository(db)

	// 4. ตั้งค่า Gin Router (ตัวรับ API)
	r := gin.Default()

	// --- เขียน API Endpoints ตรงนี้ ---

	// API: เพิ่มผู้ป่วยใหม่ (POST /patients)
	r.POST("/patients", func(c *gin.Context) {
		var p model.Patient
		if err := c.ShouldBindJSON(&p); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		if err := patientRepo.Create(&p); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not create patient"})
			return
		}

		c.JSON(http.StatusCreated, p)
	})

	// API: ดึงรายชื่อผู้ป่วยทั้งหมด (GET /patients)
	r.GET("/patients", func(c *gin.Context) {
		patients, err := patientRepo.FindAll()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not fetch patients"})
			return
		}
		c.JSON(http.StatusOK, patients)
	})

	r.GET("/patients/:id", func(c *gin.Context) {
		idParam := c.Param("id")
		var id uint
		if _, err := fmt.Sscanf(idParam, "%d", &id); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid patient ID"})
			return
		}
		patient, err := patientRepo.GetByID(id)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Patient not found"})
			return
		}
		c.JSON(http.StatusOK, patient)
	})

	// 5. รัน Server ที่ Port จาก Config
	log.Printf("🚀 Patient Service running on port %s", cfg.Server.Port)
	r.Run(":8081")
}
