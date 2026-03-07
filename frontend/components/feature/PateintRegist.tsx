'use client'
import { ChangeEvent, FormEvent, useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { createPatient } from '@/lib/api'

interface PatientFormData {
    first_name: string
    last_name: string
    age: string
    gender: string
    personal_id: string
    pharmacist_history: string
    disease_history: string
}


interface PatientRegistProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onCreated?: () => void | Promise<void>
}

const PatientRegist = ({ open, onOpenChange, onCreated }: PatientRegistProps) => {
    const [formData, setFormData] = useState<PatientFormData>({
        first_name: '',
        last_name: '',
        age: '',
        gender: '',
        personal_id: '',
        pharmacist_history: '',
        disease_history: '',
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const resetForm = () => {
        setFormData({
            first_name: '',
            last_name: '',
            age: '',
            gender: '',
            personal_id: '',
            pharmacist_history: '',
            disease_history: '',
        })
    }

    const parseHistory = (value: string): string[] => {
        return value
            .split(',')
            .map((item) => item.trim())
            .filter((item) => item.length > 0)
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setErrorMessage('')

        const age = Number(formData.age)
        if (!Number.isInteger(age) || age < 0) {
            setErrorMessage('กรุณากรอกอายุเป็นตัวเลขที่ถูกต้อง')
            return
        }

        const payload = {
            first_name: formData.first_name.trim(),
            last_name: formData.last_name.trim(),
            age,
            gender: formData.gender,
            personal_id: formData.personal_id.trim(),
            pharmacist_history: parseHistory(formData.pharmacist_history),
            disease_history: parseHistory(formData.disease_history),
        }

        try {
            setIsSubmitting(true)
            await createPatient(payload)
            await onCreated?.()
            resetForm()
            onOpenChange(false)
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to create patient'
            setErrorMessage(message)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>ลงทะเบียนผู้ป่วยใหม่</DialogTitle>
                    <DialogDescription>
                        กรุณากรอกข้อมูลผู้ป่วยให้สมบูรณ์
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto">
                    {errorMessage && (
                        <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
                            {errorMessage}
                        </div>
                    )}

                    {/* Name Row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                ชื่อ *
                            </label>
                            <input
                                type="text"
                                name="first_name"
                                value={formData.first_name}
                                onChange={handleInputChange}
                                required
                                placeholder="ชื่อจริง"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                นามสกุล *
                            </label>
                            <input
                                type="text"
                                name="last_name"
                                value={formData.last_name}
                                onChange={handleInputChange}
                                required
                                placeholder="นามสกุล"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Age / Gender / Personal ID */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                อายุ *
                            </label>
                            <input
                                type="number"
                                min={0}
                                name="age"
                                value={formData.age}
                                onChange={handleInputChange}
                                required
                                placeholder="เช่น 35"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                เลขบัตรประชาชน *
                            </label>
                            <input
                                type="text"
                                name="personal_id"
                                value={formData.personal_id}
                                onChange={handleInputChange}
                                required
                                placeholder="13 หลัก"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Gender */}
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                เพศ *
                            </label>
                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">-- เลือก --</option>
                                <option value="male">ชาย</option>
                                <option value="female">หญิง</option>
                                <option value="other">อื่นๆ</option>
                            </select>
                        </div>
                    </div>

                    {/* History fields */}
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                ประวัติการแพ้ยา (คั่นด้วย comma)
                            </label>
                            <textarea
                                name="pharmacist_history"
                                value={formData.pharmacist_history}
                                onChange={handleInputChange}
                                rows={3}
                                placeholder="เช่น penicillin, aspirin"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                ประวัติโรค (คั่นด้วย comma)
                            </label>
                            <textarea
                                name="disease_history"
                                value={formData.disease_history}
                                onChange={handleInputChange}
                                rows={3}
                                placeholder="เช่น เบาหวาน, ความดันสูง"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Buttons */}
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
                            disabled={isSubmitting}
                            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                            {isSubmitting ? 'กำลังบันทึก...' : 'บันทึก'}
                        </button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
export default PatientRegist