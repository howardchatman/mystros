import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

export const metadata = {
  title: "Apply Now",
  description: "Apply to Mystros Barber Academy",
};

const requirements = [
  "Be at least 17 years old",
  "High School Diploma or GED",
  "Valid government-issued ID",
  "Social Security card",
  "Proof of residency",
];

const steps = [
  { step: 1, title: "Submit Application", description: "Complete the online application form" },
  { step: 2, title: "Tour Campus", description: "Schedule a campus tour and meet instructors" },
  { step: 3, title: "Financial Aid", description: "Complete FAFSA and explore funding options" },
  { step: 4, title: "Enrollment", description: "Sign enrollment agreement and start your journey" },
];

export default function ApplyPage() {
  return (
    <div className="min-h-screen bg-brand-bg">
      {/* Header */}
      <header className="border-b border-brand-primary/30 bg-brand-elevated/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-brand-accent flex items-center justify-center">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <span className="text-xl font-display font-bold text-brand-text">Mystros</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/programs" className="text-brand-muted hover:text-brand-text transition-colors">
              Programs
            </Link>
            <Link href="/login" className="text-brand-muted hover:text-brand-text transition-colors">
              Sign In
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-brand-text mb-4">
            Start Your Application
          </h1>
          <p className="text-xl text-brand-muted max-w-2xl mx-auto">
            Take the first step toward your barbering career. Apply today!
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="pb-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Requirements */}
            <Card className="bg-brand-elevated border-brand-primary/30">
              <CardHeader>
                <CardTitle className="text-brand-text">Requirements</CardTitle>
                <CardDescription className="text-brand-muted">
                  What you need to apply
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-brand-accent mt-0.5 flex-shrink-0" />
                      <span className="text-brand-text">{req}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Apply Card */}
            <Card className="bg-brand-elevated border-brand-accent/50">
              <CardHeader>
                <CardTitle className="text-brand-text">Ready to Apply?</CardTitle>
                <CardDescription className="text-brand-muted">
                  Create an account to start your application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-brand-muted text-sm">
                  Already have an account? Sign in to continue your application.
                </p>
                <div className="space-y-3">
                  <Link href="/login?redirect=/intake" className="block">
                    <Button className="w-full" size="lg">
                      Sign In to Apply
                    </Button>
                  </Link>
                  <p className="text-center text-brand-muted text-sm">
                    or
                  </p>
                  <Link href="/contact" className="block">
                    <Button variant="outline" className="w-full">
                      Contact Admissions
                    </Button>
                  </Link>
                </div>
                <p className="text-xs text-brand-muted text-center pt-4">
                  Questions? Call us at{" "}
                  <a href="tel:+17139992904" className="text-brand-accent hover:underline">
                    (713) 999-2904
                  </a>
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Application Steps */}
          <div className="mt-12">
            <h2 className="text-2xl font-display font-bold text-brand-text mb-6 text-center">
              Application Process
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {steps.map((step) => (
                <Card key={step.step} className="bg-brand-elevated border-brand-primary/30">
                  <CardContent className="pt-6">
                    <div className="w-10 h-10 rounded-full bg-brand-accent/20 flex items-center justify-center mb-4">
                      <span className="text-brand-accent font-bold">{step.step}</span>
                    </div>
                    <h3 className="font-semibold text-brand-text mb-1">{step.title}</h3>
                    <p className="text-sm text-brand-muted">{step.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Financial Aid */}
          <div className="mt-12 text-center p-8 rounded-2xl bg-brand-primary/20 border border-brand-accent/20">
            <h2 className="text-xl font-display font-bold text-brand-text mb-2">
              Financial Aid Available
            </h2>
            <p className="text-brand-muted mb-4">
              We accept Federal Financial Aid. FAFSA School Code: <strong className="text-brand-accent">042609</strong>
            </p>
            <p className="text-sm text-brand-ice">
              Payment plans also available for those who qualify.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-brand-primary/30 py-8 px-4">
        <div className="container mx-auto text-center text-brand-muted text-sm">
          &copy; {new Date().getFullYear()} Mystros Barber Academy. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
