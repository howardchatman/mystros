"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, Loader2 } from "lucide-react";

interface LeadCaptureFormProps {
  heading?: string;
  description?: string;
  source?: string;
}

export function LeadCaptureForm({
  heading = "Ready to Start Your Journey?",
  description = "Get more information about our programs and financial aid options.",
  source = "website",
}: LeadCaptureFormProps) {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    programInterest: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          source,
          utmSource: searchParams.get("utm_source") || undefined,
          utmMedium: searchParams.get("utm_medium") || undefined,
          utmCampaign: searchParams.get("utm_campaign") || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }

      setSuccess(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <Card className="bg-brand-elevated border-brand-accent/50">
        <CardContent className="pt-8 pb-8">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-xl font-display font-bold text-brand-text mb-2">
              Thanks for your interest!
            </h3>
            <p className="text-brand-muted">
              We'll be in touch soon with more information about our programs.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-brand-elevated border-brand-primary/30">
      <CardHeader className="text-center">
        <CardTitle className="text-brand-text">{heading}</CardTitle>
        <CardDescription className="text-brand-muted">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-brand-text">First Name *</Label>
              <Input
                id="firstName"
                required
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                className="bg-brand-bg border-brand-primary/30 text-brand-text"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-brand-text">Last Name *</Label>
              <Input
                id="lastName"
                required
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                className="bg-brand-bg border-brand-primary/30 text-brand-text"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-brand-text">Email *</Label>
            <Input
              id="email"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="bg-brand-bg border-brand-primary/30 text-brand-text"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-brand-text">Phone</Label>
            <Input
              id="phone"
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="bg-brand-bg border-brand-primary/30 text-brand-text"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="programInterest" className="text-brand-text">Program Interest</Label>
            <select
              id="programInterest"
              value={form.programInterest}
              onChange={(e) => setForm({ ...form, programInterest: e.target.value })}
              className="w-full h-10 rounded-md border border-brand-primary/30 bg-brand-bg px-3 text-sm text-brand-text"
            >
              <option value="">Select a program...</option>
              <option value="class_a_barber">Class A Barber (1500 hours)</option>
              <option value="crossover">Barber Crossover (300 hours)</option>
              <option value="instructor">Barber Instructor (750 hours)</option>
              <option value="not_sure">Not sure yet</option>
            </select>
          </div>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              "Get More Information"
            )}
          </Button>

          <p className="text-xs text-brand-muted text-center">
            By submitting this form, you agree to receive communications from Mystros Barber Academy.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
