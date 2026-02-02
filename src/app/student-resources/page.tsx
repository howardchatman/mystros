import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, ExternalLink, GraduationCap, DollarSign, FileText, ShieldCheck } from "lucide-react";
import { Footer } from "@/components/layout/footer";

export const metadata = {
  title: "Student Resources | Mystros Barber Academy",
  description: "Resources for current and prospective students at Mystros Barber Academy.",
};

const resources = [
  {
    title: "FAFSA Application",
    description: "Complete your Free Application for Federal Student Aid. Mystros school code: 042609.",
    icon: DollarSign,
    url: "https://studentaid.gov/h/apply-for-aid/fafsa",
    external: true,
  },
  {
    title: "TDLR - Barber Licensing",
    description: "Texas Department of Licensing and Regulation barber licensing information and exam registration.",
    icon: ShieldCheck,
    url: "https://www.tdlr.texas.gov/barbers/barbers.htm",
    external: true,
  },
  {
    title: "Student Portal Login",
    description: "Access your student dashboard, hours tracking, schedule, and financial aid information.",
    icon: GraduationCap,
    url: "/login",
    external: false,
  },
  {
    title: "Financial Aid Information",
    description: "Learn about financial aid options, eligibility requirements, and how to apply.",
    icon: DollarSign,
    url: "/financial-aid",
    external: false,
  },
  {
    title: "Consumer Disclosures",
    description: "Completion rates, placement rates, accreditation information, and cost of attendance.",
    icon: FileText,
    url: "/consumer-disclosures",
    external: false,
  },
  {
    title: "COE Accreditation",
    description: "Council on Occupational Education — our national accrediting body.",
    icon: ShieldCheck,
    url: "https://council.org",
    external: true,
  },
];

const studyTips = [
  "Review sanitation and safety protocols daily — these are heavily tested on the state board exam.",
  "Practice your clipper techniques during open floor time. Repetition builds muscle memory.",
  "Study the Texas Barber Act and TDLR rules — several state board questions come from these.",
  "Maintain consistent attendance. Clock hours cannot be made up and directly affect your graduation date.",
  "Use the student portal to track your hours and SAP status regularly.",
  "Build a portfolio of your work from day one — it will help with job placement.",
];

export default function StudentResourcesPage() {
  return (
    <div className="min-h-screen bg-brand-bg">
      <header className="border-b border-brand-primary/30 bg-brand-elevated/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-brand-accent flex items-center justify-center">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <span className="text-xl font-display font-bold text-brand-text">Mystros</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/login" className="text-brand-muted hover:text-brand-text transition-colors text-sm">
              Sign In
            </Link>
            <Link href="/apply">
              <Button size="sm">Apply Now</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-12">
            <h1 className="text-3xl font-display font-bold text-brand-text mb-4">Student Resources</h1>
            <p className="text-brand-muted">
              Everything you need to succeed at Mystros Barber Academy — from financial aid applications
              to state licensing resources and study tips.
            </p>
          </div>

          {/* Resource Links */}
          <div className="grid sm:grid-cols-2 gap-4 mb-12">
            {resources.map((r) => (
              <Card key={r.title} className="bg-brand-elevated border-brand-primary/20 hover:border-brand-accent/40 transition-colors">
                <CardHeader className="pb-2">
                  <CardTitle className="text-brand-text flex items-center gap-2 text-lg">
                    <r.icon className="w-5 h-5 text-brand-accent" />
                    {r.title}
                    {r.external && <ExternalLink className="w-3.5 h-3.5 text-brand-muted" />}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-brand-muted mb-3">{r.description}</p>
                  {r.external ? (
                    <a href={r.url} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="outline">Visit</Button>
                    </a>
                  ) : (
                    <Link href={r.url}>
                      <Button size="sm" variant="outline">Go</Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Study Tips */}
          <Card className="bg-brand-elevated border-brand-primary/20">
            <CardHeader>
              <CardTitle className="text-brand-text flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-brand-gold" />
                Tips for Success
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {studyTips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-brand-muted">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-accent/20 text-brand-accent flex items-center justify-center text-xs font-bold">
                      {i + 1}
                    </span>
                    {tip}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Contact CTA */}
          <div className="mt-12 text-center">
            <p className="text-brand-muted mb-4">
              Need help? Contact your campus for additional support.
            </p>
            <Link href="/contact">
              <Button variant="outline">Contact Us</Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
