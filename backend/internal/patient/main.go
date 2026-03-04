package main

import (
	"net/http"
	"patient/model"
	"patient/repository"

	"github.com/gin-gonic/gin"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	// 1. เชื่อมต่อ PostgreSQL
	// ทริค: ถ้าเชื่อม Supabase ไม่ติด ลองเปลี่ยน sslmode=disable เป็น sslmode=require
	dsn := "host=aws-1-ap-southeast-1.pooler.supabase.com user=postgres.efawsreegafuebccehef password=MDD_password160369 dbname=postgres port=5432 sslmode=require"
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		panic("Failed to connect to database")
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

	// 5. รัน Server ที่ Port 8080 (หรือเลขอื่นก็ได้)
	r.Run(":8080") 
}