import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import { parseApiError } from "@/lib/api/parse-error";
import { getApi, useApi } from "@/lib/api/services";
import { useAuth } from "../auth/stores/auth.store";

export function DeleteAccount({ username }: { username?: string }) {
  const [open, setOpen] = useState(false);
  const [confirmValue, setConfirmValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  const api = useApi();
  const { mutateAsync: deleteMe, isPending } = api.users.deleteMe();
  const { clear } = useAuth();
  const navigate = useNavigate();

  const isConfirmed = confirmValue === username;

  const handleDelete = async () => {
    if (!isConfirmed) return;
    setError(null);

    try {
      await deleteMe();
      // Logout and clear auth state
      try {
        await getApi().auth.logout();
      } catch {
        // Ignore logout errors — account is already deleted
      }
      clear();
      navigate({ to: "/", replace: true });
    } catch (err) {
      const { globalError } = parseApiError(err);
      setError(globalError ?? "Failed to delete account. Please try again.");
    }
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      setConfirmValue("");
      setError(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="destructive">Delete account</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete your account</DialogTitle>
          <DialogDescription>
            This action is <strong>permanent and irreversible</strong>. All your
            data will be deleted immediately.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            To confirm, type your username{" "}
            <span className="font-mono font-semibold text-foreground">
              {username}
            </span>{" "}
            below.
          </p>

          <Field>
            <FieldLabel htmlFor="delete-confirm">Your username</FieldLabel>
            <InputGroup>
              <InputGroupInput
                id="delete-confirm"
                value={confirmValue}
                onChange={(e) => setConfirmValue(e.target.value)}
                placeholder={username}
                autoComplete="off"
              />
            </InputGroup>
          </Field>

          {error && <FieldError>{error}</FieldError>}
        </div>

        <DialogFooter showCloseButton>
          <Button
            variant="destructive"
            disabled={!isConfirmed || isPending}
            onClick={handleDelete}
          >
            {isPending ? "Deleting..." : "Yes, delete my account"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
