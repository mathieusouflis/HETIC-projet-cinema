import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "@tanstack/react-router";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { RegisterErrorCode } from "../hooks/useRegister";
import { useRegister } from "../hooks/useRegister";

const schema = z
  .object({
    email: z.string().email("Invalid email"),
    username: z.string().min(3, "Username too short"),
    password: z.string().min(6, "Password too short"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof schema>;

export function RegisterForm() {
  const { register: registerUser, isLoading } = useRegister();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(values: FormValues) {
    try {
      await registerUser(values.email, values.username, values.password);
    } catch (err: unknown) {
      const error = err as { code?: RegisterErrorCode };

      switch (error.code) {
        case "EMAIL_ALREADY_EXISTS":
          form.setError("email", {
            message: "This email is already in use",
          });
          break;

        case "USERNAME_TAKEN":
          form.setError("username", {
            message: "This username is already taken",
          });
          break;

        default:
          form.setError("root", {
            message: "Server error. Please try again.",
          });
      }
    }
  }

  return (
    <div className="flex min-h-screen">
      <div className="flex w-full lg:w-1/2 items-center justify-center px-6 sm:px-12 lg:px-20">
        <Card className="w-full max-w-md space-y-6 text-center shadow-none border-none">
          <CardHeader>
            <CardTitle>
              <h1 className="text-2xl font-bold">Create an account</h1>
            </CardTitle>
            <CardDescription className="text-center">
              or{" "}
              <Link to="/login" className="underline">
                Sign in
              </Link>
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* EMAIL */}
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@email.com"
                  className="border-0 border-b shadow-none rounded-none focus-visible:ring-0 focus-visible:border-primary px-0 py-0"
                  {...form.register("email")}
                />
                {form.formState.errors.email && (
                  <p className="text-destructive text-sm mt-1">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>

              {/* USERNAME */}
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="yourusername"
                  className="border-0 border-b shadow-none rounded-none focus-visible:ring-0 focus-visible:border-primary px-0 py-0"
                  {...form.register("username")}
                />
                {form.formState.errors.username && (
                  <p className="text-destructive text-sm mt-1">
                    {form.formState.errors.username.message}
                  </p>
                )}
              </div>

              {/* PASSWORD */}
              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className="border-0 border-b shadow-none rounded-none focus-visible:ring-0 focus-visible:border-primary px-0 py-0"
                    {...form.register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {form.formState.errors.password && (
                  <p className="text-destructive text-sm mt-1">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>

              {/* CONFIRM PASSWORD */}
              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    className="border-0 border-b shadow-none rounded-none focus-visible:ring-0 focus-visible:border-primary px-0 py-0"
                    {...form.register("confirmPassword")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1"
                  >
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {form.formState.errors.confirmPassword && (
                  <p className="text-destructive text-sm mt-1">
                    {form.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {/* SERVER ERROR */}
              {form.formState.errors.root && (
                <p className="text-destructive text-sm">
                  {form.formState.errors.root.message}
                </p>
              )}

              {/* BUTTONS */}
              <div className="flex justify-end gap-4 pt-12">
                <Link to="/login">
                  <Button variant="secondary">Sign In</Button>
                </Link>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center"
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin mr-2" size={18} />
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="hidden lg:flex lg:w-1/2 items-center justify-center px-16 bg-neutral-800 text-white">
        <div>
          <p className="text-3xl lg:text-4xl font-serif">
            “Lorem ipsum is, in <br /> printing”
          </p>
          <p className="mt-6 text-base">- Albert Einstein</p>
        </div>
      </div>
    </div>
  );
}
