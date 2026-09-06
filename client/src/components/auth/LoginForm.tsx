import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle2, Eye, EyeOff, Loader2, Lock, Mail, Send } from "lucide-react";
import { useState } from "react";
import type { AxiosError } from "axios";
import { useForm } from "react-hook-form";
import { Link, useSearchParams } from "react-router";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLogin, useResendVerification } from "@/hooks/useAuth";
import { loginSchema, type LoginFormData } from "@/lib/validations/auth.schema";

export const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  
  const isVerifiedBanner = searchParams.get("verified") === "true";
  const isUnverifiedBanner = searchParams.get("unverified") === "true";

  const { mutate: login, isPending } = useLogin();
  const { mutate: resendVerification, isPending: isResending, isSuccess: isResendSuccess } = useResendVerification();

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginFormData) => {
    setUnverifiedEmail(null);
    login(data, {
      onError: (err: AxiosError) => {
        if (err.response?.status === 403) {
          setUnverifiedEmail(data.email);
        }
      },
    });
  };

  const handleResend = () => {
    const targetEmail = unverifiedEmail || getValues("email");
    if (targetEmail) {
      resendVerification({ email: targetEmail });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {isVerifiedBanner && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-md text-xs flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Email verified successfully! You can now log in.
        </div>
      )}

      {isUnverifiedBanner && (
        <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 rounded-md text-xs flex items-center gap-2">
          <Mail className="h-4 w-4 shrink-0" />
          Registration successful! We sent a verification link to your email.
        </div>
      )}

      {unverifiedEmail && (
        <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 rounded-md text-xs space-y-2">
          <div className="flex items-start gap-2 font-medium">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>Email verification required before logging in.</span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleResend}
            disabled={isResending}
            className="w-full text-xs h-8 border-amber-500/30 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300"
          >
            {isResending ? (
              <span className="flex items-center gap-1.5">
                <Loader2 className="h-3 w-3 animate-spin" />
                Sending verification link...
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <Send className="h-3 w-3" />
                Resend Verification Email
              </span>
            )}
          </Button>
        </div>
      )}

      {isResendSuccess && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-md text-xs flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          A new verification link has been sent to your inbox.
        </div>
      )}

      {/* Email Field */}
      <div className="space-y-2">
        <Label
          htmlFor="email"
          className="text-xs font-semibold text-foreground"
        >
          Email Address
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            className={`pl-9 ${errors.email ? "border-destructive focus-visible:ring-destructive" : ""}`}
            {...register("email")}
            disabled={isPending}
          />
        </div>
        {errors.email && (
          <p className="text-xs text-destructive font-medium">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label
            htmlFor="password"
            className="text-xs font-semibold text-foreground"
          >
            Password
          </Label>
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            className={`pl-9 pr-9 ${errors.password ? "border-destructive focus-visible:ring-destructive" : ""}`}
            {...register("password")}
            disabled={isPending}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-destructive font-medium">
            {errors.password.message}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full bg-zinc-900 hover:bg-zinc-800 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 font-medium h-10 shadow-sm transition-colors mt-2 rounded-none"
        disabled={isPending}
      >
        {isPending ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Signing in...
          </span>
        ) : (
          "Sign In"
        )}
      </Button>

      {/* Switch to Register */}
      <div className="text-center pt-3 text-xs text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          to="/register"
          className="font-medium text-foreground hover:underline transition-colors"
        >
          Create an account
        </Link>
      </div>
    </form>
  );
};
