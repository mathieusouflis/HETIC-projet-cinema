import React from "react";
import LoginForm from "../../components/features/auth/LoginForm";

export const loginRoute = {
  path: "/login",
  component: LoginPage,
};

function LoginPage() {
  return (
    <div className="flex min-h-screen">
      {/* Left side */}
      <div className="w-1/2 bg-white flex flex-col justify-center px-16">
        <h1 className="font-Inter text-black font-bold text-3xl mb-2">Login</h1>
        <p className="text-[14px] mb-6">
          Or{" "}
          <a href="/register" className="underline">
            Create an account
          </a>
        </p>
        <LoginForm />
      </div>

      {/* Right side */}
      <div className="w-1/2 bg-[var(--darkBg)] flex flex-col justify-center items-center text-white text-center p-8">
        <p className="font-Lora text-[36px] mb-4">
          “Le lorem ipsum est, en imprimerie”
        </p>
        <span className="text-[16px]">- Albert Einstein</span>
      </div>
    </div>
  );
}

export default LoginPage;