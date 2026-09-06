import type { AxiosError } from "axios";
import { AlertCircle, CheckCircle2, Loader2, MailCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router";

import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useResendVerification, useVerifyEmail } from "@/hooks/useAuth";

export const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  
  const [resendEmail, setResendEmail] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const attemptedRef = useRef(false);

  const { mutate: verifyEmail, isPending, isSuccess, isError, error } = useVerifyEmail();
  const { mutate: resendVerification, isPending: isResending } = useResendVerification();

  useEffect(() => {
    if (token && !attemptedRef.current) {
      attemptedRef.current = true;
      verifyEmail(token);
    }
  }, [token, verifyEmail]);

  const handleResend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail) return;
    resendVerification(
      { email: resendEmail },
      {
        onSuccess: () => setHasSubmitted(true),
      }
    );
  };

  return (
    <AuthLayout
      title="Email Verification"
      subtitle="Confirming your email address for Event Planner"
    >
      <div className="space-y-6">
        {!token && (
          <div className="text-center space-y-4">
            <div className="inline-flex p-3 rounded-full bg-amber-500/10 text-amber-500 mb-2">
              <AlertCircle className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-semibold">Missing Verification Token</h3>
            <p className="text-sm text-muted-foreground">
              No verification token was provided in the link. Please check your email inbox and click the exact link provided.
            </p>

            <form onSubmit={handleResend} className="pt-4 space-y-4 text-left border-t border-border">
              <div className="space-y-2">
                <Label htmlFor="resend-email" className="text-xs font-semibold">
                  Resend Verification Email
                </Label>
                <Input
                  id="resend-email"
                  type="email"
                  placeholder="Enter your email address"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={isResending || !resendEmail}
                className="w-full bg-zinc-900 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                {isResending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending Link...
                  </span>
                ) : (
                  "Resend Verification Link"
                )}
              </Button>
            </form>
          </div>
        )}

        {token && isPending && (
          <div className="py-8 text-center space-y-4">
            <div className="inline-flex p-4 rounded-full bg-primary/10 text-primary animate-pulse">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
            <h3 className="text-lg font-semibold">Verifying Email Address...</h3>
            <p className="text-sm text-muted-foreground">
              Please wait while we validate your email verification token.
            </p>
          </div>
        )}

        {token && isSuccess && (
          <div className="py-4 text-center space-y-4">
            <div className="inline-flex p-3 rounded-full bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Email Verified!</h3>
            <p className="text-sm text-muted-foreground">
              Your email address has been successfully confirmed. You can now access all features of Event Planner.
            </p>
            <div className="pt-4">
              <Link to="/login">
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold h-11">
                  Sign In to Your Account
                </Button>
              </Link>
            </div>
          </div>
        )}

        {token && isError && (
          <div className="text-center space-y-4">
            <div className="inline-flex p-3 rounded-full bg-destructive/10 text-destructive">
              <AlertCircle className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-semibold text-destructive">Verification Failed</h3>
            <p className="text-sm text-muted-foreground">
              {(error as AxiosError<{ message?: string }>)?.response?.data?.message || "The verification link is invalid or has expired."}
            </p>

            <form onSubmit={handleResend} className="pt-4 space-y-4 text-left border-t border-border">
              <p className="text-xs text-muted-foreground font-medium">
                Enter your email address below to receive a new verification link:
              </p>
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="name@example.com"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={isResending || !resendEmail}
                className="w-full bg-zinc-900 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900"
              >
                {isResending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending Link...
                  </span>
                ) : (
                  "Send New Verification Link"
                )}
              </Button>
            </form>
          </div>
        )}

        {hasSubmitted && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-md text-xs flex items-center gap-2">
            <MailCheck className="h-4 w-4 shrink-0" />
            If your email is registered, a new verification link has been sent to your inbox.
          </div>
        )}

        <div className="text-center pt-2">
          <Link to="/login" className="text-xs text-muted-foreground hover:text-foreground underline">
            Back to Sign In
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};

export default VerifyEmailPage;
