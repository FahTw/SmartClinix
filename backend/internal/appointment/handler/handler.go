package handler

import (
	"context"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"appointment/client"
	"appointment/messaging"
	"appointment/model"
	"appointment/repository"

	"github.com/gin-gonic/gin"
)

type AppointmentHandler struct {
	repo          repository.AppointmentRepository
	publisher     *messaging.AppointmentPublisher
	patientClient *client.PatientClient
}

func NewAppointmentHandler(repo repository.AppointmentRepository, publisher *messaging.AppointmentPublisher, patientClient *client.PatientClient) *AppointmentHandler {
	return &AppointmentHandler{
		repo:          repo,
		publisher:     publisher,
		patientClient: patientClient,
	}
}

// API: สร้างนัดหมายใหม่
func (h *AppointmentHandler) Create(c *gin.Context) {
	var appt model.Appointment
	if err := c.ShouldBindJSON(&appt); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if appt.PatientID == 0 || appt.DoctorID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "patient_id and doctor_id are required"})
		return
	}

	if h.patientClient != nil {
		if _, err := h.patientClient.GetPatientByID(appt.PatientID); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid patient_id"})
			return
		}
	}

	if appt.Status == "" {
		appt.Status = "scheduled"
	}

	if err := h.repo.Create(&appt); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "DB Error: " + err.Error()})
		return
	}

	// ส่ง event ไปยัง message queue (asynchronously)
	go func() {
		if h.publisher == nil {
			return
		}
		publishCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		_ = h.publisher.PublishAppointmentCreated(publishCtx, appt)
	}()

	c.JSON(http.StatusCreated, appt)
}
func (h *AppointmentHandler) GetAll(c *gin.Context) {
	appts, err := h.repo.FindAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, appts)
}

// API: อัปเดตการนัดหมาย (พร้อมเช็คเงื่อนไข 24 ชั่วโมง)
func (h *AppointmentHandler) Update(c *gin.Context) {
	idParam := c.Param("id")
	id, _ := strconv.ParseUint(idParam, 10, 32)

	// 1. ดึงข้อมูลนัดหมายเดิมออกมาก่อน
	existingAppt, err := h.repo.GetByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Appointment not found"})
		return
	}

	// 2. ตรวจสอบเงื่อนไข: ห้ามแก้ถ้าน้อยกว่า 24 ชั่วโมง
	dateTimeStr := fmt.Sprintf("%s %s", existingAppt.Date, existingAppt.Time)
	apptTime, parseErr := time.Parse("2006-01-02 15:04", dateTimeStr)

	if parseErr == nil {
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
	if updateData.PatientID != 0 {
		existingAppt.PatientID = updateData.PatientID
	}
	if updateData.DoctorID != 0 {
		existingAppt.DoctorID = updateData.DoctorID
	}
	existingAppt.Date = updateData.Date
	existingAppt.Time = updateData.Time
	existingAppt.Description = updateData.Description
	if updateData.Status != "" {
		existingAppt.Status = updateData.Status
	}

	// 4. บันทึกลง Database
	if err := h.repo.Update(existingAppt); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not update appointment"})
		return
	}

	c.JSON(http.StatusOK, existingAppt)
}

func (h *AppointmentHandler) Delete(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid appointment ID"})
		return
	}

	if _, err := h.repo.GetByID(uint(id)); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Appointment not found"})
		return
	}

	if err := h.repo.Delete(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not delete appointment"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Appointment deleted"})
}

// GetPatients เรียกข้อมูลผู้ป่วยทั้งหมดจาก Patient Service
func (h *AppointmentHandler) GetPatients(c *gin.Context) {
	patients, err := h.patientClient.GetAllPatients()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch patients: " + err.Error()})
		return
	}
	c.JSON(http.StatusOK, patients)
}
