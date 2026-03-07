import { useEffect, useState } from "react"

const LoginPage = () => {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    async function handleLogin(e: React.FormEvent) {
        e.preventDefault()
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        })
        if (res.ok) {
            window.location.href = '/'
        } else {
            alert('Login failed. Please check your credentials and try again.')
        }
    }

    return (
        <div className="flex h-screen items-center justify-center">
            <div className="max-w-md w-full md:h-96 bg-white p-8 rounded-lg shadow-md">
                <h1 className="text-4xl text-center my-12">Login</h1>
                <form className="flex flex-col gap-4">
                    <input 
                        type="text" 
                        placeholder="Email" 
                        className="border rounded-md p-2" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <input 
                        type="password" 
                        placeholder="Password" 
                        className="border rounded-md p-2" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button type="submit" className="bg-blue-500 text-white p-2">เข้าสู่ระบบ</button>
                </form>
            </div>
        </div>

    )
}
export default LoginPage