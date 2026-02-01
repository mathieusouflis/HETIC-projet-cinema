import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export default function Input({ label, ...props }: InputProps) {
  return (
    <div className="flex flex-col w-full mb-4">
      <label className="text-[12px] font-medium mb-1">{label}</label>
      <input
        className="border-b border-gray-400 bg-transparent py-2 placeholder-gray-400 text-[16px] focus:outline-none"
        {...props}
      />
    </div>
  );
}