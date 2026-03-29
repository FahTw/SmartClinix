package messaging

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"time"

	"appointment/model"

	amqp "github.com/rabbitmq/amqp091-go"
)

const (
	MedicalRecordNeededQueue = "medical_record_needed"
)

type AppointmentPublisher struct {
	rabbitMQURL string
}

// AppointmentCreatedEvent ส่งไปยัง Patient + Medical Records service เพื่ออัปเดตประวัติ
type AppointmentCreatedEvent struct {
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

func NewAppointmentPublisher(rabbitMQURL string) *AppointmentPublisher {
	return &AppointmentPublisher{
		rabbitMQURL: rabbitMQURL,
	}
}

// NewAppointmentPublisherFromEnv สร้าง publisher จาก environment variable
func NewAppointmentPublisherFromEnv() *AppointmentPublisher {
	rabbitMQURL := os.Getenv("RABBITMQ_URL")
	if rabbitMQURL == "" {
		rabbitMQURL = "amqp://guest:guest@rabbitmq:5672/"
	}
	return NewAppointmentPublisher(rabbitMQURL)
}

// PublishAppointmentCreated ส่ง event เมื่อสร้างนัดหมายใหม่
func (p *AppointmentPublisher) PublishAppointmentCreated(ctx context.Context, appointment model.Appointment) error {
	if appointment.PatientID == 0 || appointment.DoctorID == 0 {
		return fmt.Errorf("patient_id and doctor_id are required for appointment event")
	}

	conn, err := amqp.Dial(p.rabbitMQURL)
	if err != nil {
		return err
	}
	defer conn.Close()

	ch, err := conn.Channel()
	if err != nil {
		return err
	}
	defer ch.Close()

	event := AppointmentCreatedEvent{
		EventID:    fmt.Sprintf("appointment-created-%d-%d", appointment.ID, time.Now().UnixNano()),
		EventType:  "medical_record_needed",
		OccurredAt: time.Now().UTC(),
	}

	event.Appointment.ID = appointment.ID
	event.Appointment.PatientID = appointment.PatientID
	event.Appointment.DoctorID = appointment.DoctorID
	event.Appointment.Date = appointment.Date
	event.Appointment.Time = appointment.Time
	event.Appointment.Status = appointment.Status

	body, err := json.Marshal(event)
	if err != nil {
		return err
	}

	// ส่ง event ไปยัง medical_record_needed queue เพื่อให้ medical_records service สร้าง record
	qMedical, err := ch.QueueDeclare(MedicalRecordNeededQueue, true, false, false, false, nil)
	if err != nil {
		return err
	}

	err = ch.PublishWithContext(ctx, "", qMedical.Name, false, false,
		amqp.Publishing{
			ContentType:  "application/json",
			DeliveryMode: amqp.Persistent,
			Timestamp:    time.Now().UTC(),
			Body:         body,
		})

	return err
}
