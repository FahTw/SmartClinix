package messaging

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"medical_records/model"
	"medical_records/repository"

	amqp "github.com/rabbitmq/amqp091-go"
	"gorm.io/gorm"
)

const AppointmentEventQueue = "medical_record_needed"

type AppointmentEventConsumer struct {
	rabbitMQURL string
	repo        repository.MedicalRecordRepository
}

type AppointmentEvent struct {
	EventID     string    `json:"event_id"`
	EventType   string    `json:"event_type"`
	OccurredAt  time.Time `json:"occurred_at"`
	Appointment struct {
		ID        uint   `json:"id"`
		PatientID uint   `json:"patient_id"`
		DoctorID  uint   `json:"doctor_id"`
		Date      string `json:"date"`
		Time      string `json:"time"`
		Status    string `json:"status"`
	} `json:"appointment"`
}

func NewAppointmentEventConsumer(rabbitMQURL string, repo repository.MedicalRecordRepository) *AppointmentEventConsumer {
	return &AppointmentEventConsumer{
		rabbitMQURL: rabbitMQURL,
		repo:        repo,
	}
}

// ConsumeAppointmentEvents ฟังรับข้อมูล appointment เพื่อสร้าง medical record
func (c *AppointmentEventConsumer) ConsumeAppointmentEvents(ctx context.Context) error {
	conn, err := amqp.Dial(c.rabbitMQURL)
	if err != nil {
		return err
	}
	defer conn.Close()

	ch, err := conn.Channel()
	if err != nil {
		return err
	}
	defer ch.Close()

	// ประกาศ Queue
	q, err := ch.QueueDeclare(AppointmentEventQueue, true, false, false, false, nil)
	if err != nil {
		return err
	}

	// รับ messages
	msgs, err := ch.Consume(q.Name, "", false, false, false, false, nil)
	if err != nil {
		return err
	}

	log.Printf("✅ Medical Records Consumer: Waiting for appointment events from queue: %s", q.Name)

	for {
		select {
		case <-ctx.Done():
			log.Println("❌ Medical Records Consumer stopped")
			return ctx.Err()
		case msg, ok := <-msgs:
			if !ok {
				return fmt.Errorf("rabbitmq delivery channel closed")
			}
			if msg.Body == nil {
				_ = msg.Ack(false)
				continue
			}

			// Parse event
			var event AppointmentEvent
			if err := json.Unmarshal(msg.Body, &event); err != nil {
				log.Printf("❌ Failed to unmarshal appointment event: %v", err)
				_ = msg.Nack(false, false)
				continue
			}

			if event.Appointment.ID == 0 || event.Appointment.PatientID == 0 || event.Appointment.DoctorID == 0 {
				log.Printf("❌ Invalid appointment event payload: appointment_id=%d, patient_id=%d, doctor_id=%d", event.Appointment.ID, event.Appointment.PatientID, event.Appointment.DoctorID)
				_ = msg.Nack(false, false)
				continue
			}

			log.Printf("📩 Received appointment event for patient_id=%d, doctor_id=%d", event.Appointment.PatientID, event.Appointment.DoctorID)

			if _, err := c.repo.GetByAppointmentID(event.Appointment.ID); err == nil {
				log.Printf("ℹ️ Medical record already exists for appointment_id=%d, skipping", event.Appointment.ID)
				_ = msg.Ack(false)
				continue
			} else if err != gorm.ErrRecordNotFound {
				log.Printf("❌ Failed to check existing medical record for appointment_id=%d: %v", event.Appointment.ID, err)
				_ = msg.Nack(false, true)
				continue
			}

			visitDate := event.OccurredAt
			if event.Appointment.Date != "" && event.Appointment.Time != "" {
				parsed, err := time.Parse("2006-01-02 15:04", event.Appointment.Date+" "+event.Appointment.Time)
				if err == nil {
					visitDate = parsed.UTC()
				}
			}

			// สร้าง medical record จาก appointment event
			// เก็บแค่ ID ที่จำเป็น ชื่อสามารถเติมภายหลังจาก service ต้นทางได้
			note := "Created from appointment event"
			record := &model.MedicalRecord{
				AppointmentID: event.Appointment.ID,
				PatientID:     event.Appointment.PatientID,
				DoctorID:      event.Appointment.DoctorID,
				VisitDate:     visitDate,
				Diagnosis:     "Pending",
				Treatment:     "Pending",
				Note:          &note,
			}

			// บันทึกลง database
			if err := c.repo.Create(record); err != nil {
				log.Printf("❌ Failed to create medical record: %v", err)
				_ = msg.Nack(false, true)
				continue
			}

			log.Printf("✅ Medical record created for appointment_id=%d", event.Appointment.ID)
			_ = msg.Ack(false)
		}
	}
}
