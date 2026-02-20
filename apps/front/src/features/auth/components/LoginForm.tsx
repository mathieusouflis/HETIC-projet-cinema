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
import { AuthError, useLogin } from "../hooks/useLogin";

const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormValues = z.infer<typeof schema>;

export function LoginForm() {
  const { login, isLoading } = useLogin();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(values: FormValues) {
    try {
      await login(values.email, values.password);
    } catch (error: unknown) {
      if (error instanceof AuthError) {
        switch (error.code) {
          case "INVALID_CREDENTIALS":
            form.setError("password", {
              message: "Email ou mot de passe incorrect",
            });
            return;

          case "USER_NOT_FOUND":
            form.setError("email", {
              message: "Aucun compte avec cet email",
            });
            return;

          default:
            form.setError("root", {
              message: "Erreur serveur. Réessaie.",
            });
            return;
        }
      }

      form.setError("root", {
        message: "Erreur inattendue.",
      });
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* LEFT */}
      <div className="flex w-full lg:w-1/2 items-center justify-center px-6 sm:px-12 lg:px-20">
        <Card className="w-full max-w-md space-y-6 text-center shadow-none border-none">
          <CardHeader>
            <CardTitle>
              <h1 className="text-2xl font-bold">Login</h1>
            </CardTitle>
            <CardDescription className="text-center">
              or{" "}
              <Link to="/register" className="underline">
                Create an account
              </Link>
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 "
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

              {form.formState.errors.root && (
                <p className="text-destructive text-sm">
                  {form.formState.errors.root.message}
                </p>
              )}

              <div className="flex justify-end gap-4 pt-12">
                <Link to="/register">
                  <Button variant="secondary">Create Account</Button>
                </Link>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center"
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin mr-2" size={18} />
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* RIGHT */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center px-16 bg-neutral-800 text-white">
        <div>
          <p className="text-3xl lg:text-4xl font-serif">
            “Le lorem ipsum est, en <br />
            imprimerie”
          </p>
          <p className="mt-6 text-base">- Albert Einstein</p>
        </div>
      </div>
    </div>
  );
}
