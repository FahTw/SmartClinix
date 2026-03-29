package client

import (
	"encoding/json"
	"fmt"
	"net/http"
)

type PatientClient struct {
	baseURL string
}

type PatientData struct {
	ID         uint   `json:"id"`
	FirstName  string `json:"first_name"`
	LastName   string `json:"last_name"`
	Age        int    `json:"age"`
	Gender     string `json:"gender"`
	PersonalID string `json:"personal_id"`
}

func NewPatientClient(baseURL string) *PatientClient {
	return &PatientClient{
		baseURL: baseURL,
	}
}

// GetAllPatients เรียกข้อมูลผู้ป่วยทั้งหมดจาก patient service
func (pc *PatientClient) GetAllPatients() ([]PatientData, error) {
	url := fmt.Sprintf("%s/patients", pc.baseURL)

	resp, err := http.Get(url)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch patients: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("patient service returned %d", resp.StatusCode)
	}

	var patients []PatientData
	if err := json.NewDecoder(resp.Body).Decode(&patients); err != nil {
		return nil, fmt.Errorf("failed to decode response: %v", err)
	}

	return patients, nil
}

// GetPatientByID เรียกข้อมูลผู้ป่วยตามรหัส
func (pc *PatientClient) GetPatientByID(id uint) (*PatientData, error) {
	url := fmt.Sprintf("%s/patients/%d", pc.baseURL, id)

	resp, err := http.Get(url)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch patient: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("patient service returned %d", resp.StatusCode)
	}

	var patient PatientData
	if err := json.NewDecoder(resp.Body).Decode(&patient); err != nil {
		return nil, fmt.Errorf("failed to decode response: %v", err)
	}

	return &patient, nil
}
