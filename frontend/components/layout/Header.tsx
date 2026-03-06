'use client'

type HeadProps = {
    title: string;
    description?: string;
}
const Header = (props: HeadProps) => {
  return (
    <div className="bg-blue-500 text-white p-4">
      <h1 className="text-2xl font-bold">{props.title}</h1>
      {props.description && <p className="mt-1">{props.description}</p>}
    </div>
  )
}
export default Header