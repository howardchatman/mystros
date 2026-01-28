"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginSchema, type LoginFormData } from "@/lib/validations/auth";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

// Admin roles that should redirect to admin dashboard
const adminRoles = [
  "superadmin",
  "campus_admin",
  "admissions",
  "financial_aid",
  "instructor",
  "registrar",
  "auditor",
];

export function LoginForm() {
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
    console.log("[Login] Attempting login for:", data.email);

    try {
      const supabase = createClient();

      // Sign in with Supabase client-side
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        console.error("[Login] Auth error:", error.message);
        toast.error(error.message || "Invalid email or password");
        return;
      }

      if (!authData.user) {
        toast.error("An unexpected error occurred. Please try again.");
        return;
      }

      console.log("[Login] Auth success, user:", authData.user.id);

      // Get user profile to determine redirect
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("role")
        .eq("id", authData.user.id)
        .single();

      console.log("[Login] Profile:", profile);

      // Determine redirect based on role
      let redirectTo = redirect || "/dashboard";
      if (!redirect && profile?.role && adminRoles.includes(profile.role)) {
        redirectTo = "/admin/dashboard";
      }

      toast.success("Welcome back!");
      console.log("[Login] Redirecting to:", redirectTo);

      // Full page navigation to ensure session is read
      window.location.href = redirectTo;
    } catch (error) {
      console.error("[Login] Error:", error);
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

      {/* Test accounts hint */}
      <div className="mt-4 p-3 rounded-lg bg-brand-primary/20 border border-brand-accent/20">
        <p className="text-xs text-brand-muted text-center">
          <span className="font-medium text-brand-ice">Test Accounts (password: Mystros2024!)</span>
          <br />
          <span className="text-brand-ice/80">Admin:</span> admin@mystros.com
          <br />
          <span className="text-brand-ice/80">Student:</span> student@mystros.com
        </p>
      </div>
    </form>
  );
}
