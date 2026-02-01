// -RegisterPage.tsx
import React from "react";
import RegisterForm from "../../components/features/auth/RegisterForm";

export const registerRoute = {
  path: "/register",
  component: RegisterPage,
};

function RegisterPage() {
  return (
    <div className="flex min-h-screen">
      <div className="w-1/2 bg-white flex flex-col justify-center px-16">
        <h1 className="font-Inter text-black font-bold text-3xl mb-2">Register</h1>
        <RegisterForm />
      </div>
      <div className="w-1/2 bg-[var(--darkBg)] flex flex-col justify-center items-center text-white text-center p-8">
        <p className="font-Lora text-[36px] mb-4">“Le lorem ipsum est, en imprimerie”</p>
        <span className="text-[16px]">- Albert Einstein</span>
      </div>
    </div>
  );
}

export default RegisterPage;