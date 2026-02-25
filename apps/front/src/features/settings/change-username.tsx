import { zodResolver } from "@hookform/resolvers/zod";
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

const changeUsernameSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be less than 30 characters")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Username can only contain letters, numbers, hyphens, and underscores"
    ),
});

type ChangeUsernameFormValues = z.infer<typeof changeUsernameSchema>;

export function ChangeUsernameForm({
  currentUsername,
}: {
  currentUsername?: string;
}) {
  const api = useApi();
  const { mutateAsync: patchMe, isPending } = api.users.patchMe();

  const form = useForm<ChangeUsernameFormValues>({
    resolver: zodResolver(changeUsernameSchema),
    defaultValues: {
      username: currentUsername ?? "",
    },
  });

  const globalError = form.formState.errors.root?.message;

  const onSubmit = async (data: ChangeUsernameFormValues) => {
    try {
      await patchMe({ username: data.username });
      form.reset({ username: data.username });
    } catch (err) {
      const { fieldErrors, globalError } = parseApiError(err);

      if (fieldErrors.username) {
        form.setError("username", { message: fieldErrors.username });
      } else if (globalError) {
        form.setError("root", { message: globalError });
      }
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <Controller
          name="username"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Username</FieldLabel>
              <InputGroup>
                <InputGroupInput
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  placeholder="your-username"
                  autoComplete="username"
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
      <Button type="submit" disabled={isPending} className="mt-4">
        {isPending ? "Saving..." : "Save username"}
      </Button>
    </form>
  );
}
