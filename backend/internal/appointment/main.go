package main

import (
	"appointment/client"
	"appointment/config"
	"appointment/database"
	"appointment/handler"
	"appointment/messaging"
	"appointment/model"
	"appointment/repository"
	"log"
	"os"

	"github.com/gin-contrib/cors"
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
	publisher := messaging.NewAppointmentPublisherFromEnv()

	// สร้าง Patient Client เพื่อเรียกข้อมูลผู้ป่วย
	patientServiceURL := os.Getenv("PATIENT_SERVICE_URL")
	if patientServiceURL == "" {
		patientServiceURL = "http://patient-service:8080"
	}
	patientClient := client.NewPatientClient(patientServiceURL)

	// 5. เริ่มใช้งาน Handler (โยน Repo + Publisher + PatientClient ให้ Handler)
	apptHandler := handler.NewAppointmentHandler(apptRepo, publisher, patientClient)

	// 6. ตั้งค่า Gin Router
	r := gin.Default()
	r.Use(cors.New(cors.Config{
		AllowOrigins: []string{"*"},
		AllowMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders: []string{"Content-Type", "Authorization"},
	}))

	// ผูกเส้นทางไปที่ Handler
	r.GET("/appointments", apptHandler.GetAll)
	r.GET("/patients", apptHandler.GetPatients)
	r.POST("/appointments", apptHandler.Create)
	r.PUT("/appointments/:id", apptHandler.Update)
	r.DELETE("/appointments/:id", apptHandler.Delete)

	// 7. รัน Server
	log.Printf("🚀 Appointment Service running on port 8083")
	r.Run(":8083")
}
