package handler

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"appointment/model"
	"appointment/repository"

	"github.com/gin-gonic/gin"
	amqp "github.com/rabbitmq/amqp091-go"
)

type AppointmentHandler struct {
	repo repository.AppointmentRepository
}

func NewAppointmentHandler(repo repository.AppointmentRepository) *AppointmentHandler {
	return &AppointmentHandler{repo}
}

// 🟢 API: สร้างนัดหมายใหม่
func (h *AppointmentHandler) Create(c *gin.Context) {
	var appt model.Appointment
	if err := c.ShouldBindJSON(&appt); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := h.repo.Create(&appt); err != nil {
    c.JSON(http.StatusInternalServerError, gin.H{"error": "DB Error: " + err.Error()})
    return
}

	go func(appointmentData model.Appointment) {
		conn, err := amqp.Dial("amqp://guest:guest@localhost:5672/")
		if err != nil {
			return
		}
		defer conn.Close()

		ch, _ := conn.Channel()
		defer ch.Close()

		q, _ := ch.QueueDeclare("appointment_created", false, false, false, false, nil)

		body, _ := json.Marshal(appointmentData)

		ch.PublishWithContext(c.Request.Context(), "", q.Name, false, false,
			amqp.Publishing{
				ContentType: "application/json",
				Body:        body,
			})
	}(appt)

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
// 🟡 API: อัปเดตการนัดหมาย (พร้อมเช็คเงื่อนไข 24 ชั่วโมง)
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
	existingAppt.Date = updateData.Date
	existingAppt.Time = updateData.Time
	existingAppt.Description = updateData.Description

	// 4. บันทึกลง Database
	if err := h.repo.Update(existingAppt); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not update appointment"})
		return
	}

	c.JSON(http.StatusOK, existingAppt)
}