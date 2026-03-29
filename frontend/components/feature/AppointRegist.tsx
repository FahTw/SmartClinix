'use client'
import { useEffect, useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

export interface AppointFormData {
    patient_id: number
    doctor_id: number
    date: string
    time: string
    description: string
    status: 'scheduled' | 'completed' | 'cancelled'
}

interface PatientOption {
    id: number
    first_name: string
    last_name: string
}

interface DoctorOption {
    id: number
    username: string
}

interface AppointRegistProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    patients: PatientOption[]
    doctors: DoctorOption[]
    initialData?: AppointFormData | null
    title?: string
    submitLabel?: string
    onSubmit?: (data: AppointFormData) => void
}

const defaultFormData: AppointFormData = {
    patient_id: 0,
    doctor_id: 0,
    date: '',
    time: '',
    description: '',
    status: 'scheduled',
}

const AppointRegist = ({ open, onOpenChange, patients, doctors, initialData, title, submitLabel, onSubmit }: AppointRegistProps) => {
    const [formData, setFormData] = useState<AppointFormData>({
        ...defaultFormData,
    })

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'patient_id' || name === 'doctor_id' ? Number(value) : value,
        }))
    }

    useEffect(() => {
        if (open && initialData) {
            setFormData(initialData)
        }
        if (open && !initialData) {
            setFormData(defaultFormData)
        }
    }, [open, initialData])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSubmit?.(formData)
        setFormData(defaultFormData)
        onOpenChange(false)
        console.log('Submitted appointment data:', formData)
    }

    const dialogTitle = title || 'เพิ่มนัดหมายผู้ป่วย'
    const buttonLabel = submitLabel || 'บันทึกนัดหมาย'

    return (
        <Dialog
            open={open}
            onOpenChange={(nextOpen) => {
                onOpenChange(nextOpen)
                if (!nextOpen) {
                    setFormData(defaultFormData)
                }
            }}
        >
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{dialogTitle}</DialogTitle>
                    <DialogDescription>
                        กรอกข้อมูลนัดหมายให้ครบถ้วนเพื่อบันทึกเข้าระบบ
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">ผู้ป่วย *</label>
                            <select
                                name="patient_id"
                                value={formData.patient_id || ''}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="" disabled>เลือกผู้ป่วย</option>
                                {patients.map((patient) => (
                                    <option key={patient.id} value={patient.id}>
                                        {patient.first_name} {patient.last_name} (ID: {patient.id})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">แพทย์ผู้ดูแล *</label>
                            <select
                                name="doctor_id"
                                value={formData.doctor_id || ''}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="" disabled>เลือกแพทย์</option>
                                {doctors.map((doctor) => (
                                    <option key={doctor.id} value={doctor.id}>
                                        {doctor.username} (ID: {doctor.id})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">วันที่นัด *</label>
                            <input
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">เวลา *</label>
                            <input
                                type="time"
                                name="time"
                                value={formData.time}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">อาการหรือเหตุผลที่มาพบแพทย์ *</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            required
                            rows={3}
                            placeholder="เช่น มีไข้ต่อเนื่อง 3 วัน ไอ และเจ็บคอ"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">สถานะนัดหมาย *</label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="scheduled">scheduled</option>
                            <option value="completed">completed</option>
                            <option value="cancelled">cancelled</option>
                        </select>
                    </div>

                    <div className="flex gap-4 justify-end pt-4 border-t">
                        <button
                            type="button"
                            onClick={() => onOpenChange(false)}
                            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                        >
                            ยกเลิก
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                            {buttonLabel}
                        </button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
export default AppointRegist