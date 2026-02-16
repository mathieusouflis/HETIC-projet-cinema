import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import type * as React from "react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getApi } from "@/lib/api/services";

export const Route = createFileRoute("/register/")({
  component: RouteComponent,
});

function RouteComponent() {
  const services = getApi();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const isFormValid =
    email.length > 3 &&
    username.length > 2 &&
    password.length >= 6 &&
    password === confirmPassword;

  async function handleRegister(e: React.FormEvent) {
    console.log("SUBMIT TRIGGERED");
    e.preventDefault();

    if (!isFormValid) {
      toast.error("Please complete the form correctly");
      return;
    }

    try {
      setLoading(true);

      await services.auth.register(email, password, username);

      toast.success("Account created successfully 👏");

      navigate({ to: "/login" });
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Registration failed");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-2">
      {/* LEFT */}
      <div className="flex items-center justify-center bg-white px-8">
        <form onSubmit={handleRegister} className="w-full max-w-md space-y-6">
          {/* TITLE */}
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-bold">Create an account</h1>
            <p className="text-sm text-muted-foreground">
              or{" "}
              <Link to="/login" className="underline font-medium">
                Sign in to your account
              </Link>
            </p>
          </div>

          {/* EMAIL */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Email</Label>
            <Input
              type="email"
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border-0 border-b rounded-none focus-visible:ring-0 px-0 py-5"
            />
          </div>

          {/* USERNAME */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Username</Label>
            <Input
              type="text"
              placeholder="Your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="border-0 border-b rounded-none focus-visible:ring-0 px-0 py-5"
            />
          </div>

          {/* PASSWORD */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Password</Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-0 border-b rounded-none focus-visible:ring-0 px-0 py-5"
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

          {/* CONFIRM PASSWORD */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Confirm Password</Label>
            <Input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="border-0 border-b rounded-none focus-visible:ring-0 px-0 py-5"
            />
          </div>

          {/* BUTTONS */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="secondary"
              className="flex-1 rounded-full bg-[#E4E4E4] text-black hover:bg-[#d5d5d5]"
              onClick={() => navigate({ to: "/login" })}
              disabled={loading}
            >
              Sign In
            </Button>

            <Button
              type="submit"
              disabled={!isFormValid || loading}
              className="flex-1 rounded-full bg-[#2E2E2E] hover:bg-black"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                "Sign Up"
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* RIGHT */}
      <div className="hidden md:flex items-center justify-center bg-[#313131] text-white p-12">
        <div className="max-w-md text-center space-y-6">
          <p className="font-serif text-4xl leading-tight">
            “Le succès appartient à ceux qui osent.”
          </p>
          <span className="text-base opacity-80">— Unknown</span>
        </div>
      </div>
    </div>
  );
}
