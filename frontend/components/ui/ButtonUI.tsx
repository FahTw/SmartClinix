'use client';

type ButtonProps = {
    title: string;
    onClick?: () => void;
}
const Button = (props: ButtonProps) => {
  return (
    <button onClick={props.onClick} className="px-4 py-2 bg-blue-500 text-white rounded">
        {props.title}
    </button>
  )
}
export default Button