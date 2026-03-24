import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
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
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import { useForgotPassword } from "../hooks/useForgotPassword";
import {
  type ForgotPasswordFormValues,
  forgotPasswordSchema,
} from "../schemas/auth.schemas";

export function ForgotPasswordForm() {
  const { requestReset, isLoading } = useForgotPassword();
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const globalError = form.formState.errors.root?.message;

  async function onSubmit(values: ForgotPasswordFormValues) {
    try {
      await requestReset(values.email);
      setSubmitted(true);
    } catch (err: unknown) {
      const error = err as {
        fieldErrors?: Record<string, string>;
        globalError?: string | null;
      };

      if (error.fieldErrors?.email) {
        form.setError("email", { message: error.fieldErrors.email });
      } else if (error.globalError) {
        form.setError("root", { message: error.globalError });
      }
    }
  }

  return (
    <div className="flex min-h-screen">
      <div className="flex w-full lg:w-1/2 items-center justify-center px-6 sm:px-12 lg:px-20">
        <Card className="w-full max-w-md space-y-6 text-center shadow-none border-none">
          <CardHeader>
            <CardTitle>
              <h1 className="text-2xl font-bold">Forgot Password</h1>
            </CardTitle>
            <CardDescription className="text-center">
              Enter your email to receive a reset link
            </CardDescription>
          </CardHeader>
          <CardContent>
            {submitted ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  If that email address is registered, you will receive a reset
                  link shortly. Check your inbox.
                </p>
                <Link to="/login" className="underline text-sm">
                  Back to login
                </Link>
              </div>
            ) : (
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
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
                </FieldGroup>

                {globalError && (
                  <FieldError errors={[{ message: globalError }]} />
                )}

                <div className="flex justify-between items-center pt-4">
                  <Link to="/login" className="text-sm underline">
                    Back to login
                  </Link>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <Loader2 className="animate-spin mr-2" size={18} />
                    ) : (
                      "Send reset link"
                    )}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="hidden lg:flex lg:w-1/2 items-center justify-center px-16 bg-neutral-800 text-white">
        <div>
          <p className="text-3xl lg:text-4xl font-serif">
            "Forgotten passwords,
            <br />
            remembered security"
          </p>
        </div>
      </div>
    </div>
  );
}
