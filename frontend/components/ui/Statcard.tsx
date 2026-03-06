interface StatcardProps {
    title: string
    number: number
    icon: React.ReactNode
}
const Statcard = (props: StatcardProps) => {
    const { title, number, icon } = props
    return (
        <div className="bg-white rounded-lg shadow p-4 flex items-center space-x-4 flex-1">
            <div className="p-3 rounded-full bg-blue-100 text-blue-500">
                {icon}
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <p className="text-xl font-semibold text-gray-900">{number}</p>
            </div>
        </div>
    )
}
export default Statcard