import { Suspense } from "react";
import { LoginForm } from "./login-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

export const metadata = {
  title: "Sign In",
  description: "Sign in to your Mystros Barber Academy account",
};

export default function LoginPage() {
  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-display">Welcome Back</CardTitle>
        <CardDescription>
          Sign in to your Mystros account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Suspense fallback={<div className="h-64 animate-pulse bg-white/5 rounded-lg" />}>
          <LoginForm />
        </Suspense>

        <div className="mt-6 text-center text-sm">
          <p className="text-brand-muted">
            Don&apos;t have an account?{" "}
            <Link
              href="/apply"
              className="text-brand-accent hover:text-brand-accent2 transition-colors font-medium"
            >
              Apply Now
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
