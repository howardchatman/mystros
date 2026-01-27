"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginSchema, type LoginFormData } from "@/lib/validations/auth";
import { signIn } from "@/lib/actions/auth";
import Link from "next/link";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "";

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginFormData) {
    setIsLoading(true);

    try {
      const result = await signIn(data.email, data.password);

      if (!result.success) {
        toast.error(result.error || "Invalid email or password");
        return;
      }

      toast.success("Welcome back!");

      // Redirect to the intended page or the default dashboard
      const redirectTo = redirect || result.redirectTo || "/dashboard";
      router.push(redirectTo);
      router.refresh();
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-4">
        {/* Email field */}
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-brand-muted pointer-events-none" />
          <Input
            {...register("email")}
            type="email"
            placeholder="Email address"
            autoComplete="email"
            className="pl-10"
            error={errors.email?.message}
            disabled={isLoading}
          />
        </div>

        {/* Password field */}
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-brand-muted pointer-events-none" />
          <Input
            {...register("password")}
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            autoComplete="current-password"
            className="pl-10 pr-10"
            error={errors.password?.message}
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-text transition-colors"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Forgot password link */}
      <div className="flex justify-end">
        <Link
          href="/forgot-password"
          className="text-sm text-brand-muted hover:text-brand-accent transition-colors"
        >
          Forgot password?
        </Link>
      </div>

      {/* Submit button */}
      <Button
        type="submit"
        className="w-full"
        size="lg"
        isLoading={isLoading}
      >
        Sign In
      </Button>

      {/* Demo accounts hint */}
      <div className="mt-4 p-3 rounded-lg bg-brand-primary/20 border border-brand-accent/20">
        <p className="text-xs text-brand-muted text-center">
          <span className="font-medium text-brand-ice">Demo accounts (password: Demo123!)</span>
          <br />
          <span className="text-brand-ice/80">Student:</span> test123@demo.com
          <br />
          <span className="text-brand-ice/80">Admin:</span> admin@demo.com
        </p>
      </div>
    </form>
  );
}
