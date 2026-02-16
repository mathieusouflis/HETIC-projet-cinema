import { createFileRoute /*Link*/ } from "@tanstack/react-router";
/*import { Loader2 } from "lucide-react";
import type * as React from "react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getApi } from "@/lib/api/services";*/

export const Route = createFileRoute("/forgot-password/")({
  component: RouteComponent,
});
function RouteComponent() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-sm text-muted-foreground">
        Forgot password page temporarily disabled.
      </p>
    </div>
  );
}

/*
function RouteComponent() {
  const services = getApi();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const isValidEmail = email.includes("@") && email.length > 5;

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();

    if (!isValidEmail) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      setLoading(true);

      await services.auth.forgotPassword(email);

      // Message neutre → sécurité
      toast.success(
        "If this email exists, a password reset link has been sent."
      );

      setEmail("");

    } catch (error) {
      // Toujours message neutre
      toast.success(
        "If this email exists, a password reset link has been sent."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-2">
      
      <div className="flex items-center justify-center bg-white px-8">
        <form
          onSubmit={handleForgotPassword}
          className="w-full max-w-md space-y-6"
        >
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-bold">Forgot Password</h1>
            <p className="text-sm text-muted-foreground">
              Enter your email and we’ll send you a reset link.
            </p>
            <p className="text-sm">
              <Link to="/login" className="underline font-medium">
                Back to login
              </Link>
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium">Email</Label>
            <Input
              type="email"
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="border-0 border-b rounded-none focus-visible:ring-0 px-0 py-5"
            />
          </div>


          <Button
            type="submit"
            disabled={!isValidEmail || loading}
            className="w-full rounded-full bg-[#2E2E2E] hover:bg-black"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              "Send Reset Link"
            )}
          </Button>
        </form>
      </div>
      <div className="hidden md:flex items-center justify-center bg-[#313131] text-white p-12">
        <div className="max-w-md text-center space-y-6">
          <p className="font-serif text-4xl leading-tight">
            “Security is not a product, but a process.”
          </p>
          <span className="text-base opacity-80">— Bruce Schneier</span>
        </div>
      </div>
    </div>
  );
} */
