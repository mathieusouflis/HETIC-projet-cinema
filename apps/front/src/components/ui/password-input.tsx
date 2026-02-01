import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export default function PasswordInput({ label, ...props }: PasswordInputProps) {
  const [show, setShow] = useState(false);
  return (
    <div className="flex flex-col w-full mb-4 relative">
      <label className="text-[12px] font-medium mb-1">{label}</label>
      <input
        type={show ? "text" : "password"}
        className="border-b border-gray-400 bg-transparent py-2 pr-10 text-[16px] placeholder-gray-400 focus:outline-none"
        {...props}
      />
      <button
        type="button"
        className="absolute right-0 top-7 p-2"
        onClick={() => setShow(!show)}
      >
        {show ? <Eye size={20} /> : <EyeOff size={20} />}
      </button>
    </div>
  );
}