const LoginPage = () => {
    return (
        <div className="flex h-screen items-center justify-center">
            <div className="max-w-md w-full md:h-96 bg-white p-8 rounded-lg shadow-md">
                <h1 className="text-4xl text-center my-12">Login</h1>
                <form className="flex flex-col gap-4">
                    <input type="text" placeholder="Username" className="border rounded-md p-2" />
                    <input type="password" placeholder="Password" className="border rounded-md p-2" />
                    <button type="submit" className="bg-blue-500 text-white p-2">เข้าสู่ระบบ</button>
                </form>
            </div>
        </div>

    )
}
export default LoginPage