import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useVerifyEmail } from "@/features/auth/hooks/useVerifyEmail";

export const Route = createFileRoute("/verify-email/")({
  validateSearch: (search: Record<string, unknown>) => ({
    token: typeof search.token === "string" ? search.token : undefined,
  }),
  component: VerifyEmailPage,
});

function VerifyEmailPage() {
  const { token } = Route.useSearch();
  const { isLoading, isSuccess, error } = useVerifyEmail(token);

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <Card className="w-full max-w-md text-center shadow-none border-none space-y-4">
        <CardHeader>
          <div className="flex justify-center mb-4">
            {isLoading && (
              <Loader2
                size={48}
                className="animate-spin text-muted-foreground"
              />
            )}
            {isSuccess && <CheckCircle size={48} className="text-green-500" />}
            {error && <XCircle size={48} className="text-destructive" />}
          </div>
          <CardTitle>
            <h1 className="text-2xl font-bold">
              {isLoading && "Verifying..."}
              {isSuccess && "Email verified!"}
              {error && "Invalid link"}
            </h1>
          </CardTitle>
          <CardDescription>
            {isLoading && "Please wait while we verify your email."}
            {isSuccess && "Your account has been activated. Redirecting..."}
            {error && error}
          </CardDescription>
        </CardHeader>
        {error && (
          <CardContent className="space-y-4">
            <Button asChild className="w-full">
              <Link to="/login">Request a new link</Link>
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
