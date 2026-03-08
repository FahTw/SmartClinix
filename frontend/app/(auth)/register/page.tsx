"use client"

import { useState } from "react"
import { register, setAuthToken, login } from "@/lib/api"
import Link from "next/link"

const RegisterPage = () => {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [role, setRole] = useState<'doctor' | 'pharmacist' | 'admin'>('doctor')
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    async function handleRegister(e: React.FormEvent) {
        e.preventDefault()
        setError('')

        if (password !== confirmPassword) {
            setError('รหัสผ่านไม่ตรงกัน')
            return
        }

        if (password.length < 6) {
            setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร')
            return
        }

        setIsLoading(true)

        try {
            await register({ username, password, role })
            // Auto login after successful registration
            const { token } = await login({ username, password })
            setAuthToken(token)
            window.location.href = '/'
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Registration failed'
            setError(message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex h-screen items-center justify-center bg-linear-to-br from-blue-50 to-blue-100">
            <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">ลงทะเบียน</h1>
                    <p className="text-gray-600 mt-2">สร้างบัญชีผู้ใช้ SmartClinic</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                        {error}
                    </div>
                )}

                <form className="flex flex-col gap-4" onSubmit={handleRegister}>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Username *
                        </label>
                        <input 
                            type="text" 
                            placeholder="กรอก username" 
                            className="w-full border border-gray-300 rounded-md p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Role *
                        </label>
                        <select
                            className="w-full border border-gray-300 rounded-md p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={role}
                            onChange={(e) => setRole(e.target.value as 'doctor' | 'pharmacist' | 'admin')}
                            required
                        >
                            <option value="doctor">แพทย์ (Doctor)</option>
                            <option value="pharmacist">เภสัชกร (Pharmacist)</option>
                            <option value="admin">ผู้ดูแลระบบ (Admin)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Password *
                        </label>
                        <input 
                            type="password" 
                            placeholder="กรอก password (อย่างน้อย 6 ตัวอักษร)" 
                            className="w-full border border-gray-300 rounded-md p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Confirm Password *
                        </label>
                        <input 
                            type="password" 
                            placeholder="ยืนยัน password" 
                            className="w-full border border-gray-300 rounded-md p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="bg-blue-600 text-white py-2.5 rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed font-medium"
                    >
                        {isLoading ? 'กำลังลงทะเบียน...' : 'ลงทะเบียน'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                        มีบัญชีอยู่แล้ว?{' '}
                        <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                            เข้าสู่ระบบ
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default RegisterPage
