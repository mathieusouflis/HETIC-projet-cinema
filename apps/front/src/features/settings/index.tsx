import { Separator } from "@/components/ui/separator";
import { useApi } from "@/lib/api/services";
import { ChangeEmailForm } from "./change-email";
import { ChangePasswordForm } from "./change-password";
import { ChangeUsernameForm } from "./change-username";
import { DeleteAccount } from "./delete-account";

function SectionHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <h2 className="text-lg font-semibold">{title}</h2>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );
}

export function SettingsPage() {
  const api = useApi();
  const { data: profile, isLoading } = api.users.getMe();

  return (
    <div className="flex flex-col gap-8 max-w-lg">
      <h1 className="text-3xl font-bold">Settings</h1>

      {/* Profile */}
      <section className="flex flex-col gap-4">
        <SectionHeader
          title="Profile"
          description="Update your public username."
        />
        <ChangeUsernameForm
          currentUsername={isLoading ? undefined : profile?.data?.username}
        />
      </section>

      <Separator />

      {/* Security */}
      <section className="flex flex-col gap-6">
        <SectionHeader
          title="Security"
          description="Manage your email address and password."
        />
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Email
          </h3>
          <ChangeEmailForm
            currentEmail={isLoading ? undefined : profile?.data?.email}
          />
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Password
          </h3>
          <ChangePasswordForm />
        </div>
      </section>

      <Separator />

      {/* Danger Zone */}
      <section className="flex flex-col gap-4">
        <SectionHeader
          title="Danger Zone"
          description="Permanently delete your account and all associated data."
        />
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            Once you delete your account, there is no going back. Please be
            certain.
          </p>
          <DeleteAccount
            username={isLoading ? undefined : profile?.data?.username}
          />
        </div>
      </section>
    </div>
  );
}
