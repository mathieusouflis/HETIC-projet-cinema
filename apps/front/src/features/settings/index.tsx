/*
What we can edit :
- Email
- Password
- Username
- Theme (soon)
*/

import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "../auth/stores/auth.store";
import ChangeEmailForm from "./change-email";
import { ChangePasswordForm } from "./change-password";
import DeleteAccount from "./delete-account";

export function SettingsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate({ to: "/", replace: true });
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col">
      <h1>Settings</h1>
      <h2>Email</h2>
      <ChangeEmailForm />
      <h2>Password</h2>
      <ChangePasswordForm />
      <h2>Danger Zone</h2>
      <DeleteAccount />
    </div>
  );
}
