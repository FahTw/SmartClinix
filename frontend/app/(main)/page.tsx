"use client"
import Header from "../../components/layout/Header";
import Statcard from "../../components/ui/Statcard";
import { useEffect, useMemo, useState } from "react"
import PatientRegist from "../../components/feature/PateintRegist";
import { Calendar } from "@/components/ui/calendar"
import Link from "next/link"
import { getAppointments, getPatients, Patient } from "@/lib/api";

type AppointmentStatus = "scheduled" | "completed" | "cancelled"

interface Appointment {
  id: number
  patient_id: number
  doctor_id: number
  date: string
  time: string
  description: string
  status: AppointmentStatus
}
interface ApiAppointment {
  id: number
  patient_id: number
  doctor_id: number
  date: string
  time: string
  description?: string
  status?: string
}

const statusClassMap: Record<AppointmentStatus, string> = {
  scheduled: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
}

const statusTextMap: Record<AppointmentStatus, string> = {
  scheduled: "รอนัด",
  completed: "เสร็จสิ้น",
  cancelled: "ยกเลิก",
}

function normalizeStatus(status?: string): AppointmentStatus {
  if (status === "completed" || status === "cancelled") {
    return status
  }
  return "scheduled"
}

function mapApiAppointment(item: ApiAppointment): Appointment {
  return {
    id: item.id,
    patient_id: item.patient_id,
    doctor_id: item.doctor_id,
    date: item.date,
    time: item.time,
    description: item.description || "-",
    status: normalizeStatus(item.status),
  }
}

function getPatientDisplayName(patients: Patient[], patientID: number): string {
  const patient = patients.find((item) => item.id === patientID)
  if (!patient) {
    return `ID: ${patientID}`
  }
  return `${patient.first_name} ${patient.last_name}`
}

export default function Home() {
  const [isPatientRegistOpen, setIsPatientRegistOpen] = useState(false)
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [totalPatients, setTotalPatients] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [appointmentRes, patientRes] = await Promise.all([
          getAppointments(),
          getPatients(),
        ])

        const mappedAppointments = Array.isArray(appointmentRes)
          ? appointmentRes.map((item: ApiAppointment) => mapApiAppointment(item))
          : []

        setAppointments(mappedAppointments)
        setPatients(Array.isArray(patientRes) ? patientRes : [])
        setTotalPatients(Array.isArray(patientRes) ? patientRes.length : 0)
      } catch (err) {
        console.error("Failed to load dashboard data", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const recentAppointments = useMemo(() => {
    if (date) {
      const selectedDateStr = date.toISOString().split("T")[0]
      const filtered = appointments.filter((apt) => apt.date === selectedDateStr)
      if (filtered.length > 0) {
        return filtered.sort((a, b) => a.time.localeCompare(b.time)).slice(0, 5)
      }
    }
    
    
    return [...appointments]
      .sort((a, b) => {
        const dateCompare = b.date.localeCompare(a.date)
        if (dateCompare !== 0) return dateCompare
        return b.time.localeCompare(a.time)
      })
      .slice(0, 5)
  }, [date, appointments])

  const todayAppointmentsCount = appointments.filter(
    (apt) => apt.date === new Date().toISOString().split("T")[0] && apt.status === "scheduled"
  ).length

  return (
    <div className="pb-8">
      <Header title="Welcome to SmartClinic" description="Your clinic management dashboard" />

      {error && (
        <div className="mx-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex gap-4 p-4">
        <Statcard title="Total Patients" number={totalPatients} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>} />
        <Statcard 
          title="Today's Appointments" 
          number={todayAppointmentsCount} 
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>} 
        />
        <Statcard 
          title="Total Appointments" 
          number={appointments.length} 
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>} 
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 px-4 mt-4">
        {/* Calendar Section */}
        <section>
          <h2 className="text-lg text-center font-semibold text-gray-900 mb-4">ปฏิทินนัดหมาย</h2>
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-lg border mx-auto"
            captionLayout="dropdown"
          />
          <div className="mt-4 text-sm text-gray-500 text-center">
            {date ? (
              <>เลือกวันที่: {date.toLocaleDateString("th-TH")}</>
            ) : (
              <>กรุณาเลือกวันที่</>
            )}
          </div>
        </section>

        {/* Recent Appointments Section */}
        <section className="bg-white rounded-lg shadow-sm p-6 xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {date && recentAppointments.length > 0 && recentAppointments[0].date === date.toISOString().split("T")[0]
                ? `นัดหมายวันที่เลือก`
                : `Recent Appointments (5 รายการล่าสุด)`}
            </h2>
            <Link 
              href="/appointments"
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              ดูทั้งหมด →
            </Link>
          </div>

          {recentAppointments.length > 0 ? (
            <div className="space-y-3">
              {recentAppointments.map((appointment) => (
                <div 
                  key={appointment.id} 
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50/30 transition-all"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-900">{getPatientDisplayName(patients, appointment.patient_id)}</span>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusClassMap[appointment.status]}`}>
                          {statusTextMap[appointment.status]}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{appointment.description}</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {appointment.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {appointment.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Doctor ID: {appointment.doctor_id}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500 border border-dashed border-gray-300 rounded-lg">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm">ไม่มีนัดหมายในวันที่เลือก</p>
            </div>
          )}
        </section>
      </div>

      {isLoading && (
        <p className="px-4 pt-2 text-sm text-gray-500">Loading dashboard data...</p>
      )}

      <PatientRegist open={isPatientRegistOpen} onOpenChange={setIsPatientRegistOpen} />
    </div>
  );
}
