import { createFileRoute, Link } from "@tanstack/react-router";
import { Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useResendVerification } from "@/features/auth/hooks/useResendVerification";

export const Route = createFileRoute("/verify-email-pending/")({
  validateSearch: (search: Record<string, unknown>) => ({
    email: typeof search.email === "string" ? search.email : "",
  }),
  component: VerifyEmailPendingPage,
});

function VerifyEmailPendingPage() {
  const { email } = Route.useSearch();
  const { resend, isLoading, cooldown } = useResendVerification();

  const isDisabled = isLoading || cooldown > 0 || !email;

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <Card className="w-full max-w-md text-center shadow-none border-none space-y-4">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <Mail size={48} className="text-muted-foreground" />
          </div>
          <CardTitle>
            <h1 className="text-2xl font-bold">Check your inbox</h1>
          </CardTitle>
          <CardDescription>
            A verification link has been sent to{" "}
            {email ? <strong>{email}</strong> : "your email address"}.
            <br />
            Click the link in the email to activate your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={() => resend(email)}
            disabled={isDisabled}
            variant="outline"
            className="w-full"
          >
            {isLoading ? (
              <Loader2 className="animate-spin mr-2" size={18} />
            ) : null}
            {cooldown > 0 ? `Resend email (${cooldown}s)` : "Resend email"}
          </Button>
          <div>
            <Link
              to="/login"
              className="text-sm underline text-muted-foreground"
            >
              Back to login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
