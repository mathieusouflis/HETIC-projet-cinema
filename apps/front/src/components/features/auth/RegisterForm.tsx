// RegisterForm.tsx
import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form className="flex flex-col gap-4">
      <label className="text-[12px] font-medium">Email</label>
      <input
        type="email"
        placeholder="you@example.com"
        className="border-b border-[var(--border)] bg-transparent py-2 placeholder-[#868686] text-[16px] focus:outline-none"
      />

      <label className="text-[12px] font-medium mt-4">Password</label>
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          className="border-b border-[var(--border)] bg-transparent py-2 w-full placeholder-[#868686] text-[16px] focus:outline-none"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-0 top-2 p-2"
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>

      <div className="flex gap-4 mt-6">
        <button
          type="submit"
          className="bg-[var(--primary)] text-[var(--primary-foreground)] rounded-full px-6 py-2 font-semibold"
        >
          Register
        </button>
      </div>
    </form>
  );
}