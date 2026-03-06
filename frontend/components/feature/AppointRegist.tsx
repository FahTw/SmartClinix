'use client'
import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

export interface AppointFormData {
    patientName: string
    doctorName: string
    department: string
    date: string
    time: string
    appointmentType: string
    symptoms: string
    notes: string
}

interface AppointRegistProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSubmit?: (data: AppointFormData) => void
}

const defaultFormData: AppointFormData = {
    patientName: '',
    doctorName: '',
    department: '',
    date: '',
    time: '',
    appointmentType: '',
    symptoms: '',
    notes: '',
}

const AppointRegist = ({ open, onOpenChange, onSubmit }: AppointRegistProps) => {
    const [formData, setFormData] = useState<AppointFormData>({
        ...defaultFormData,
    })

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSubmit?.(formData)
        setFormData(defaultFormData)
        onOpenChange(false)
    }

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
                    <DialogTitle>เพิ่มนัดหมายผู้ป่วย</DialogTitle>
                    <DialogDescription>
                        กรอกข้อมูลนัดหมายให้ครบถ้วนเพื่อบันทึกเข้าระบบ
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อผู้ป่วย *</label>
                            <input
                                type="text"
                                name="patientName"
                                value={formData.patientName}
                                onChange={handleInputChange}
                                required
                                placeholder="เช่น สมชาย ใจดี"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">แพทย์ผู้ดูแล *</label>
                            <input
                                type="text"
                                name="doctorName"
                                value={formData.doctorName}
                                onChange={handleInputChange}
                                required
                                placeholder="เช่น นพ.ธีรภพ แสงทอง"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">แผนก *</label>
                            <select
                                name="department"
                                value={formData.department}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">-- เลือกแผนก --</option>
                                <option value="general">อายุรกรรมทั่วไป</option>
                                <option value="pediatrics">กุมารเวช</option>
                                <option value="orthopedic">กระดูกและข้อ</option>
                                <option value="dermatology">ผิวหนัง</option>
                                <option value="dentistry">ทันตกรรม</option>
                            </select>
                        </div>
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">ประเภทการนัด *</label>
                        <select
                            name="appointmentType"
                            value={formData.appointmentType}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">-- เลือกประเภท --</option>
                            <option value="new">ตรวจครั้งแรก</option>
                            <option value="follow-up">ติดตามอาการ</option>
                            <option value="consultation">ปรึกษาอาการเฉพาะทาง</option>
                            <option value="procedure">ทำหัตถการ</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">อาการหรือเหตุผลที่มาพบแพทย์ *</label>
                        <textarea
                            name="symptoms"
                            value={formData.symptoms}
                            onChange={handleInputChange}
                            required
                            rows={3}
                            placeholder="เช่น มีไข้ต่อเนื่อง 3 วัน ไอ และเจ็บคอ"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">หมายเหตุเพิ่มเติม</label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleInputChange}
                            rows={2}
                            placeholder="เช่น แพ้ยา, ต้องการพบแพทย์หญิง"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
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
                            บันทึกนัดหมาย
                        </button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
export default AppointRegist