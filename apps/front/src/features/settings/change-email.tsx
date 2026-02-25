import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import { parseApiError } from "@/lib/api/parse-error";
import { useApi } from "@/lib/api/services";

const changeEmailSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address")
    .max(255, "Email must be less than 255 characters"),
});

type ChangeEmailFormValues = z.infer<typeof changeEmailSchema>;

export function ChangeEmailForm({ currentEmail }: { currentEmail?: string }) {
  const api = useApi();
  const { mutateAsync: patchMe, isPending } = api.users.patchMe();
  const [saved, setSaved] = useState(false);

  const form = useForm<ChangeEmailFormValues>({
    resolver: zodResolver(changeEmailSchema),
    defaultValues: {
      email: currentEmail ?? "",
    },
  });

  useEffect(() => {
    if (currentEmail !== undefined) {
      form.reset({ email: currentEmail });
    }
  }, [currentEmail, form]);

  const globalError = form.formState.errors.root?.message;

  const onSubmit = async (data: ChangeEmailFormValues) => {
    try {
      await patchMe({ email: data.email });
      form.reset({ email: data.email });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      const { fieldErrors, globalError: apiError } = parseApiError(err);

      if (fieldErrors.email) {
        form.setError("email", { message: fieldErrors.email });
      } else if (apiError) {
        if (apiError.toLowerCase().includes("email")) {
          form.setError("email", {
            message: "An account with this email already exists.",
          });
        } else {
          form.setError("root", { message: apiError });
        }
      }
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Email address</FieldLabel>
              <InputGroup>
                <InputGroupInput
                  {...field}
                  id={field.name}
                  type="email"
                  aria-invalid={fieldState.invalid}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </InputGroup>
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>
      {globalError && (
        <p className="mt-2 text-sm text-destructive">{globalError}</p>
      )}
      <div className="mt-4 flex items-center gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save email"}
        </Button>
        {saved && <p className="text-sm text-green-600">Email updated.</p>}
      </div>
    </form>
  );
}
