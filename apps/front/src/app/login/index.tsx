import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff } from "lucide-react";
/*import { Login } from "@/features/auth";*/
import type * as React from "react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/features/auth/stores/auth.store";
import { getApi } from "@/lib/api/services";

/*function RouteComponent() {
  return <Login />;
}*/

export const Route = createFileRoute("/login/")({
  component: IndexPage,
});

function IndexPage() {
  const services = getApi();
  const navigate = useNavigate();

  const { setUser, setAccessToken } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    console.log("SUBMIT TRIGGERED");
    e.preventDefault();

    try {
      const response = await services.auth.login(email, password);

      setAccessToken(response.data.accessToken);
      setUser(response.data.user);

      toast.success("Welcome back 👋");

      navigate({ to: "/register" }); // change plus tard
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
        return;
      }

      toast.error("Login failed");
    }
  }

  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-2">
      {/* LEFT */}
      <div className="flex items-center justify-center bg-white px-8">
        <form onSubmit={handleLogin} className="w-full max-w-md space-y-6">
          {/* TITLE */}
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-bold">Login</h1>

            <p className="text-sm text-muted-foreground">
              or{" "}
              <Link to="/register" className="underline font-medium">
                Create an account
              </Link>
            </p>
          </div>

          {/* EMAIL */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Email</Label>

            <Input
              type="email"
              placeholder="you@email.com"
              className="
                border-0 
                border-b 
                rounded-none
                focus-visible:ring-0
                px-0
                py-5
                text-base
                placeholder:text-[#868686]
              "
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* PASSWORD */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Password</Label>

            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                className="
                  border-0 
                  border-b 
                  rounded-none
                  focus-visible:ring-0
                  px-0
                  py-5
                "
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-1/2 -translate-y-1/2"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* FORGOT */}
          <div className="text-sm">
            <Link to="/forgot-password" className="hover:underline">
              Forgot password?
            </Link>
          </div>

          {/* BUTTONS */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="secondary"
              className="flex-1 rounded-full bg-[#E4E4E4] text-black hover:bg-[#d5d5d5]"
              onClick={() => navigate({ to: "/register" })}
            >
              Create Account
            </Button>

            <Button
              type="submit"
              className="flex-1 rounded-full bg-[#2E2E2E] hover:bg-black"
            >
              Sign In
            </Button>
          </div>
        </form>
      </div>

      {/* RIGHT */}
      <div className="hidden md:flex items-center justify-center bg-[#313131] text-white p-12">
        <div className="max-w-md text-center space-y-6">
          <p className="font-serif text-4xl leading-tight">
            “Le lorem ipsum est, en imprimerie”
          </p>

          <span className="text-base opacity-80">— Albert Einstein</span>
        </div>
      </div>
    </div>
  );
}
