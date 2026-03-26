import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { useLogin } from "../hooks/useLogin";
import { useResendVerification } from "../hooks/useResendVerification";
import { type LoginFormValues, loginSchema } from "../schemas/auth.schemas";

export function LoginForm() {
  const { login, isLoading } = useLogin();
  const { resend, isLoading: isResending } = useResendVerification();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [emailNotVerified, setEmailNotVerified] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState("");

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const globalError = form.formState.errors.root?.message;

  async function onSubmit(values: LoginFormValues) {
    setEmailNotVerified(false);

    try {
      await login(values.email, values.password);
    } catch (err: unknown) {
      const error = err as {
        fieldErrors?: Record<string, string>;
        globalError?: string | null;
      };

      if (error.globalError === "EMAIL_NOT_VERIFIED") {
        setEmailNotVerified(true);
        setUnverifiedEmail(values.email);
        return;
      }

      if (error.fieldErrors) {
        for (const [field, message] of Object.entries(error.fieldErrors)) {
          form.setError(field as keyof LoginFormValues, { message });
        }
      }

      if (error.globalError) {
        form.setError("root", { message: error.globalError });
      }
    }
  }

  async function handleResendAndNavigate() {
    await resend(unverifiedEmail);
    navigate({
      to: "/verify-email-pending",
      search: { email: unverifiedEmail },
    });
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
              <FieldGroup>
                <Controller
                  name="email"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                      <InputGroup>
                        <InputGroupInput
                          {...field}
                          id={field.name}
                          type="email"
                          placeholder="you@email.com"
                          autoComplete="email"
                          aria-invalid={fieldState.invalid}
                        />
                      </InputGroup>
                      {fieldState.error && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name="password"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <div className="flex items-center justify-between">
                        <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                        <Link
                          to="/forgot-password"
                          className="text-xs underline text-muted-foreground"
                        >
                          Forgot password?
                        </Link>
                      </div>
                      <InputGroup>
                        <InputGroupInput
                          {...field}
                          id={field.name}
                          type={showPassword ? "text" : "password"}
                          autoComplete="current-password"
                          aria-invalid={fieldState.invalid}
                        />
                        <InputGroupAddon align="inline-end">
                          <InputGroupButton
                            type="button"
                            onClick={() => setShowPassword((v) => !v)}
                          >
                            {showPassword ? <EyeOff /> : <Eye />}
                          </InputGroupButton>
                        </InputGroupAddon>
                      </InputGroup>
                      {fieldState.error && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </FieldGroup>

              {globalError && (
                <FieldError errors={[{ message: globalError }]} />
              )}

              {emailNotVerified && (
                <div className="space-y-2 rounded-md border border-zinc-800 bg-zinc-900/70 p-4 text-left text-sm text-zinc-200">
                  <p className="font-medium text-zinc-100">
                    Your email address has not been verified yet.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleResendAndNavigate}
                    disabled={isResending}
                    className="w-full border-zinc-700 bg-zinc-900 text-zinc-100 hover:bg-zinc-800 hover:border-zinc-600 disabled:opacity-60"
                  >
                    {isResending ? (
                      <Loader2 className="mr-2 animate-spin" size={14} />
                    ) : null}
                    Resend verification email
                  </Button>
                </div>
              )}

              <div className="flex justify-end gap-4 pt-12">
                <Link to="/register">
                  <Button type="button" variant="secondary">
                    Create Account
                  </Button>
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
            "Lorem ipsum is, in <br />
            printing"
          </p>
          <p className="mt-6 text-base">- Albert Einstein</p>
        </div>
      </div>
    </div>
  );
}
