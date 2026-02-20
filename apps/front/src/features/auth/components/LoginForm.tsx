import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "@tanstack/react-router";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useLogin } from "../hooks/useLogin";

const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormValues = z.infer<typeof schema>;

export function LoginForm() {
  const { login } = useLogin();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(values: FormValues) {
    try {
      await login(values.email, values.password);
    } catch (error: unknown) {
      form.setError("root", {
        message: error instanceof Error ? error.message : "Login failed",
      });
    }
  }

  return (
    <div className="split-layout">
      {/* LEFT */}
      <div className="split-left">
        <div className="form-stack">
          <div className="text-center">
            <h1>Login</h1>
            <p className="text-sm mt-2">
              or{" "}
              <Link to="/register" className="underline">
                Create an account
              </Link>
            </p>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div>
              <label htmlFor="email" className="form-label block mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@email.com"
                className="form-input"
                {...form.register("email")}
              />
              {form.formState.errors.email && (
                <p className="text-sm text-destructive mt-2">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="form-label block mb-2">
                Password
              </label>

              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="form-input pr-10"
                  {...form.register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {form.formState.errors.password && (
                <p className="text-sm text-destructive mt-2">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>

            {form.formState.errors.root && (
              <p className="text-sm text-destructive">
                {form.formState.errors.root.message}
              </p>
            )}

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link
                to="/register"
                className="btn-secondary text-center rounded-full"
              >
                Create Account
              </Link>

              <button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="btn-primary flex items-center justify-center rounded-full"
              >
                {form.formState.isSubmitting ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  "Sign In"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* RIGHT */}
      <div className="split-right">
        <div>
          <p className="display-quote">“Le lorem ipsum est, en imprimerie”</p>
          <p className="quote-author">- Albert Einstein</p>
        </div>
      </div>
    </div>
  );
}
