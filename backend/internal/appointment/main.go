package main

import (
	"appointment/config"
	"appointment/database"
	"appointment/model"
	"appointment/repository"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

func main() {

	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	db, err := database.NewPostgresConnection(cfg)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}


	db.AutoMigrate(&model.Appointment{})

	apptRepo := repository.NewAppointmentRepository(db)

	r := gin.Default()
	// API: สร้างนัดหมายใหม่
	r.POST("/appointments", func(c *gin.Context) {
		var appt model.Appointment
		if err := c.ShouldBindJSON(&appt); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		if err := apptRepo.Create(&appt); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not create appointment"})
			return
		}
		c.JSON(http.StatusCreated, appt)
	})

	// API: อัปเดตการนัดหมาย (พร้อมเช็คเงื่อนไข 24 ชั่วโมง)
	r.PUT("/appointments/:id", func(c *gin.Context) {
		idParam := c.Param("id")
		id, _ := strconv.ParseUint(idParam, 10, 32)

		// 1. ดึงข้อมูลนัดหมายเดิมออกมาก่อน
		existingAppt, err := apptRepo.GetByID(uint(id))
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Appointment not found"})
			return
		}

		// 2. ตรวจสอบเงื่อนไข: ห้ามแก้ถ้าน้อยกว่า 24 ชั่วโมง
		// นำ Date และ Time มาประกอบกัน เช่น "2026-03-10 09:30"
		dateTimeStr := fmt.Sprintf("%s %s", existingAppt.Date, existingAppt.Time)
		apptTime, parseErr := time.Parse("2006-01-02 15:04", dateTimeStr) // Format มาตรฐานของ Go

		if parseErr == nil {
			// คำนวณเวลาปัจจุบัน กับ เวลานัดหมาย
			hoursLeft := time.Until(apptTime).Hours()
			if hoursLeft < 24 && hoursLeft > 0 {
				c.JSON(http.StatusForbidden, gin.H{
					"error": "ไม่สามารถแก้ไขการนัดหมายได้ เนื่องจากเหลือเวลาไม่ถึง 24 ชั่วโมง",
				})
				return
			}
		}

		// 3. รับข้อมูลใหม่จาก Request
		var updateData model.Appointment
		if err := c.ShouldBindJSON(&updateData); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// อัปเดตฟิลด์ที่ต้องการ
		existingAppt.Date = updateData.Date
		existingAppt.Time = updateData.Time
		existingAppt.Description = updateData.Description

		// 4. บันทึกลง Database
		if err := apptRepo.Update(existingAppt); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not update appointment"})
			return
		}

		c.JSON(http.StatusOK, existingAppt)
	})

	// รัน Server ที่ Port จาก Config
	log.Printf("🚀 Appointment Service running on port %s", cfg.Server.Port)
	r.Run(":" + cfg.Server.Port)
}
