import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { type PATCHUsersMeBody } from "@packages/api-sdk";
import { Button } from "@/components/ui/button";
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
import { usePatchMe } from "@/lib/api/services/users";
import { AxiosError } from "axios";

const passwordSchema = z
  .string("Password must be a string")
  .nonempty("Password is required")
  .min(8, "Password must be at least 8 characters")
  .max(100, "Password must be less than 100 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(
    /[^A-Za-z0-9]/,
    "Password must contain at least one special character",
  );

const changePasswordFormSchema = z
  .object({
    currentPassword: passwordSchema,
    newPassword: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .superRefine((data, ctx) => {
    if (data.newPassword !== data.confirmPassword) {
      ctx.addIssue({
        path: ["confirmPassword"],
        code: "custom",
        message: "Passwords do not match",
      });
    }
  });

export function ChangePasswordForm() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const {
    mutateAsync: changePassword,
    isPending,
    error,
  } = usePatchMe();

  const form = useForm<z.infer<typeof changePasswordFormSchema>>({
    resolver: zodResolver(changePasswordFormSchema),
    defaultValues: {
      currentPassword: "",
      confirmPassword: "",
      newPassword: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof changePasswordFormSchema>) => {
    const payload: PATCHUsersMeBody = {
      password: data.currentPassword,
      newPassword: data.newPassword,
      confirmPassword: data.confirmPassword,
    };

    try{

      const response = await changePassword(payload);
      console.log(response)
    }catch (err) {
      const axiosError = err as AxiosError
      console.log(axiosError.response?.data)
    }
  };

  return (
    <form id="form-change-password" onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <Controller
          name="currentPassword"
          control={form.control}
          render={({ field, fieldState }) => {
            return (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Current Password</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    {...field}
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    placeholder="Your old password"
                    autoComplete="off"
                    type={showCurrentPassword ? "text" : "password"}
                  />
                  <InputGroupAddon align={"inline-end"}>
                    <InputGroupButton
                      onClick={() => setShowCurrentPassword((old) => !old)}
                    >
                      {showCurrentPassword ? <EyeOff /> : <Eye />}
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            );
          }}
        />
        <Controller
          name="newPassword"
          control={form.control}
          render={({ field, fieldState }) => {
            return (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>New password</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    {...field}
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    placeholder="Your new password"
                    autoComplete="off"
                    type={showNewPassword ? "text" : "password"}
                  />
                  <InputGroupAddon align={"inline-end"}>
                    <InputGroupButton
                      onClick={() => setShowNewPassword((old) => !old)}
                    >
                      {showNewPassword ? <EyeOff /> : <Eye />}
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            );
          }}
        />
        <Controller
          name="confirmPassword"
          control={form.control}
          render={({ field, fieldState }) => {
            return (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>
                  Confirm new password
                </FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    {...field}
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    placeholder="Confirm your new password"
                    autoComplete="off"
                    type={showConfirmPassword ? "text" : "password"}
                  />
                  <InputGroupAddon align={"inline-end"}>
                    <InputGroupButton
                      onClick={() => setShowConfirmPassword((old) => !old)}
                    >
                      {showConfirmPassword ? <EyeOff /> : <Eye />}
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            );
          }}
        />
      </FieldGroup>
      {error && (
        <p className="mt-2 text-sm text-destructive">
          Something went wrong while changing your password. Please try again.
        </p>
      )}
      <Button type="submit" disabled={isPending}>
        {isPending ? "Changing password..." : "Change password"}
      </Button>
    </form>
  );
}
