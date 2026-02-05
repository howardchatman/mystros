import { Suspense } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, FileText, Calendar, Users, Phone, Mail, Clock } from "lucide-react";
import { LeadCaptureForm } from "@/components/marketing/lead-capture-form";

export const metadata = {
  title: "Admissions | Mystros Barber Academy",
  description: "Apply to Mystros Barber Academy. Learn about requirements, the application process, and enrollment dates.",
};

const requirements = [
  { item: "Be at least 17 years old", note: "16 with parental consent" },
  { item: "High School Diploma or GED", note: "Or currently enrolled senior" },
  { item: "Valid government-issued ID", note: "Driver's license, state ID, or passport" },
  { item: "Social Security card", note: "Original document required" },
  { item: "Proof of residency", note: "Utility bill, lease, or bank statement" },
];

const enrollmentDates = [
  { date: "February 3, 2025", program: "Class A Barber", seats: "Limited seats" },
  { date: "March 3, 2025", program: "Class A Barber", seats: "Enrolling now" },
  { date: "April 7, 2025", program: "Class A Barber", seats: "Open" },
  { date: "Rolling", program: "Crossover Program", seats: "Start anytime" },
];

const steps = [
  {
    step: 1,
    title: "Submit Application",
    description: "Complete the online application form with your personal information and program selection.",
    icon: FileText,
  },
  {
    step: 2,
    title: "Campus Tour",
    description: "Schedule a tour to see our facilities, meet instructors, and learn about daily life at Mystros.",
    icon: Users,
  },
  {
    step: 3,
    title: "Documentation",
    description: "Provide required documents including ID, Social Security card, and proof of education.",
    icon: CheckCircle,
  },
  {
    step: 4,
    title: "Financial Planning",
    description: "Meet with our financial aid team to explore funding options and complete your FAFSA.",
    icon: Calendar,
  },
];

export default function AdmissionsPage() {
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
            <Link href="/apply">
              <Button>Apply Now</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-brand-text mb-4">
            Admissions
          </h1>
          <p className="text-xl text-brand-muted max-w-2xl mx-auto mb-8">
            Your journey to becoming a professional barber starts here. We&apos;re here to guide you
            through every step of the enrollment process.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/apply">
              <Button size="lg">Start Application</Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" size="lg">Schedule a Tour</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Application Process */}
      <section className="py-16 px-4 bg-brand-elevated/50">
        <div className="container mx-auto">
          <h2 className="text-2xl font-display font-bold text-brand-text mb-8 text-center">
            Application Process
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step) => (
              <Card key={step.step} className="bg-brand-elevated border-brand-primary/30 relative">
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-brand-accent/20 flex items-center justify-center mb-4">
                    <step.icon className="w-6 h-6 text-brand-accent" />
                  </div>
                  <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-brand-primary/30 flex items-center justify-center">
                    <span className="text-brand-accent font-bold">{step.step}</span>
                  </div>
                  <CardTitle className="text-brand-text">{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-brand-muted text-sm">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-display font-bold text-brand-text mb-6">
                Admission Requirements
              </h2>
              <Card className="bg-brand-elevated border-brand-primary/30">
                <CardContent className="pt-6">
                  <ul className="space-y-4">
                    {requirements.map((req, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-brand-accent mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="text-brand-text font-medium">{req.item}</span>
                          <p className="text-brand-muted text-sm">{req.note}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
            <div>
              <h2 className="text-2xl font-display font-bold text-brand-text mb-6">
                Upcoming Start Dates
              </h2>
              <Card className="bg-brand-elevated border-brand-primary/30">
                <CardContent className="pt-6">
                  <ul className="space-y-4">
                    {enrollmentDates.map((date, i) => (
                      <li key={i} className="flex items-center justify-between p-3 rounded-lg bg-brand-primary/10">
                        <div>
                          <span className="text-brand-text font-medium">{date.date}</span>
                          <p className="text-brand-muted text-sm">{date.program}</p>
                        </div>
                        <span className="text-xs px-2 py-1 rounded-full bg-brand-accent/20 text-brand-accent">
                          {date.seats}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Admissions */}
      <section className="py-16 px-4 bg-brand-elevated/50">
        <div className="container mx-auto">
          <h2 className="text-2xl font-display font-bold text-brand-text mb-8 text-center">
            Contact Admissions
          </h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <Card className="bg-brand-elevated border-brand-primary/30 text-center">
              <CardContent className="pt-6">
                <Phone className="w-8 h-8 text-brand-accent mx-auto mb-3" />
                <CardTitle className="text-brand-text text-lg mb-2">Call Us</CardTitle>
                <a href="tel:+17139992904" className="text-brand-accent hover:underline">
                  (713) 999-2904
                </a>
              </CardContent>
            </Card>
            <Card className="bg-brand-elevated border-brand-primary/30 text-center">
              <CardContent className="pt-6">
                <Mail className="w-8 h-8 text-brand-accent mx-auto mb-3" />
                <CardTitle className="text-brand-text text-lg mb-2">Email Us</CardTitle>
                <a href="mailto:admissions@mystrosbarber.com" className="text-brand-accent hover:underline text-sm">
                  admissions@mystrosbarber.com
                </a>
              </CardContent>
            </Card>
            <Card className="bg-brand-elevated border-brand-primary/30 text-center">
              <CardContent className="pt-6">
                <Clock className="w-8 h-8 text-brand-accent mx-auto mb-3" />
                <CardTitle className="text-brand-text text-lg mb-2">Office Hours</CardTitle>
                <p className="text-brand-muted text-sm">Mon-Fri: 9am - 6pm</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Lead Capture CTA */}
      <section className="py-16 px-4 bg-brand-accent/10">
        <div className="container mx-auto max-w-lg">
          <Suspense fallback={<div className="h-96 animate-pulse bg-brand-elevated rounded-lg" />}>
            <LeadCaptureForm
              heading="Have Questions? We're Here to Help"
              description="Get personalized info about admissions, financial aid, and program options."
              source="admissions_page"
            />
          </Suspense>
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
