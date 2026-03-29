package messaging

import (
	"context"
	"encoding/json"
	"log"
	"time"

	"medical_records/model"
	"medical_records/repository"

	amqp "github.com/rabbitmq/amqp091-go"
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
	msgs, err := ch.Consume(q.Name, "", true, false, false, false, nil)
	if err != nil {
		return err
	}

	log.Printf("✅ Medical Records Consumer: Waiting for appointment events from queue: %s", q.Name)

	for {
		select {
		case <-ctx.Done():
			log.Println("❌ Medical Records Consumer stopped")
			return ctx.Err()
		case msg := <-msgs:
			if msg.Body == nil {
				continue
			}

			// Parse event
			var event AppointmentEvent
			if err := json.Unmarshal(msg.Body, &event); err != nil {
				log.Printf("❌ Failed to unmarshal appointment event: %v", err)
				continue
			}

			log.Printf("📩 Received appointment event for patient_id=%d, doctor_id=%d", event.Appointment.PatientID, event.Appointment.DoctorID)

			// สร้าง medical record จาก appointment event
			// เก็บแค่ ID ที่จำเป็น ชื่อจะสามารถ query ได้จาก patient/auth service ทีหลัง
			record := &model.MedicalRecord{
				PatientID:   event.Appointment.PatientID,
				PatientName: "TBD", // ทำได้จาก patient service ส่วนข้างหน้า
				DoctorID:    event.Appointment.DoctorID,
				DoctorName:  "TBD", // ทำได้จาก auth service ส่วนข้างหน้า
				VisitDate:   event.OccurredAt,
				Diagnosis:   "Pending",
				Treatment:   "Pending",
				Note:        "Created from appointment event",
			}

			// บันทึกลง database
			if err := c.repo.Create(record); err != nil {
				log.Printf("❌ Failed to create medical record: %v", err)
				continue
			}

			log.Printf("✅ Medical record created for appointment_id=%d", event.Appointment.ID)
		}
	}
}
