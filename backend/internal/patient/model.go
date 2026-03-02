package model

type Patient struct {
	ID        int    `json:"id"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Age       int    `json:"age"`
	PersonalID string `json:"personal_id"`
	PharmacistHistory []string `json:"pharmacist_history"`
	DiseaseHistory []string `json:"disease_history"`
}