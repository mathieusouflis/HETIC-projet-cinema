import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "@tanstack/react-router";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRegister } from "../hooks/useRegister";

const schema = z
  .object({
    email: z.string().email("Invalid email address"),
    username: z.string().min(3, "Username must be at least 3 characters"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof schema>;

export function RegisterForm() {
  const { register: registerUser } = useRegister();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // IDs accessibles
  const emailId = useId();
  const usernameId = useId();
  const passwordId = useId();
  const confirmPasswordId = useId();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(values: FormValues) {
    try {
      await registerUser(values.email, values.username, values.password);
    } catch (error: unknown) {
      form.setError("root", {
        message: error instanceof Error ? error.message : "Registration failed",
      });
    }
  }

  return (
    <div className="split-layout">
      {/* LEFT */}
      <div className="split-left">
        <div className="form-stack">
          <div className="text-center">
            <h1>Create an account</h1>
            <p className="text-sm mt-2">
              or{" "}
              <Link to="/login" className="underline">
                Sign in
              </Link>
            </p>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* EMAIL */}
            <div>
              <label htmlFor={emailId} className="form-label block mb-2">
                Email
              </label>
              <input
                id={emailId}
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

            {/* USERNAME */}
            <div>
              <label htmlFor={usernameId} className="form-label block mb-2">
                Username
              </label>
              <input
                id={usernameId}
                type="text"
                placeholder="yourusername"
                className="form-input"
                {...form.register("username")}
              />
              {form.formState.errors.username && (
                <p className="text-sm text-destructive mt-2">
                  {form.formState.errors.username.message}
                </p>
              )}
            </div>

            {/* PASSWORD */}
            <div>
              <label htmlFor={passwordId} className="form-label block mb-2">
                Password
              </label>

              <div className="relative">
                <input
                  id={passwordId}
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

            {/* CONFIRM PASSWORD */}
            <div>
              <label
                htmlFor={confirmPasswordId}
                className="form-label block mb-2"
              >
                Confirm password
              </label>

              <div className="relative">
                <input
                  id={confirmPasswordId}
                  type={showConfirm ? "text" : "password"}
                  className="form-input pr-10"
                  {...form.register("confirmPassword")}
                />

                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-0 top-1/2 -translate-y-1/2"
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {form.formState.errors.confirmPassword && (
                <p className="text-sm text-destructive mt-2">
                  {form.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* SERVER ERROR */}
            {form.formState.errors.root && (
              <p className="text-sm text-destructive">
                {form.formState.errors.root.message}
              </p>
            )}

            {/* BUTTONS */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link
                to="/login"
                className="btn-secondary text-center rounded-full"
              >
                Sign In
              </Link>

              <button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="btn-primary flex items-center justify-center rounded-full"
              >
                {form.formState.isSubmitting ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  "Create Account"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="split-right">
        <div>
          <p className="display-quote">“Le lorem ipsum est, en imprimerie”</p>
          <p className="quote-author">- Albert Einstein</p>
        </div>
      </div>
    </div>
  );
}
