import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, DollarSign, CheckCircle, Calendar, Award, BookOpen } from "lucide-react";
import { Footer } from "@/components/layout/footer";

export const metadata = {
  title: "Barber Instructor Program | Mystros Barber Academy",
  description: "750-hour Barber Instructor program. Train the next generation of barbers with your Texas Instructor license.",
};

const curriculum = [
  { module: "Teaching Methods", hours: 150, topics: ["Lesson Planning", "Classroom Management", "Student Assessment", "Curriculum Design"] },
  { module: "Instructional Techniques", hours: 200, topics: ["Demonstration Skills", "Hands-on Coaching", "Visual Aids & Technology", "Lab Supervision"] },
  { module: "Student Development", hours: 100, topics: ["Learning Styles", "Motivation Strategies", "Mentorship", "Student Safety"] },
  { module: "Administrative Skills", hours: 100, topics: ["Record Keeping", "Compliance & Regulations", "TDLR Standards", "School Operations"] },
  { module: "Advanced Barbering Review", hours: 100, topics: ["Advanced Techniques", "Trend Analysis", "Product Knowledge", "Service Excellence"] },
  { module: "Practicum", hours: 100, topics: ["Supervised Teaching", "Peer Evaluation", "Classroom Observation", "Portfolio Development"] },
];

const highlights = [
  "750 Clock Hours",
  "Texas TDLR Licensed Program",
  "COE Accredited",
  "Title IV Financial Aid Eligible",
  "Hands-on Teaching Practicum",
  "Small Class Sizes",
  "Flexible Scheduling Available",
  "Career Placement Assistance",
];

export default function InstructorPage() {
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
      <section className="py-16 px-4 bg-gradient-to-b from-brand-primary/20 to-transparent">
        <div className="container mx-auto">
          <div className="max-w-3xl">
            <span className="inline-block px-3 py-1 rounded-full bg-brand-gold/20 text-brand-gold text-sm font-medium mb-4">
              Shape the Future
            </span>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-brand-text mb-6">
              Barber Instructor Program
            </h1>
            <p className="text-lg text-brand-muted mb-8">
              Transform your barbering expertise into a teaching career. Our 750-hour Instructor program
              prepares licensed barbers to become certified educators, combining advanced teaching
              methodology with TDLR compliance training.
            </p>
            <div className="flex flex-wrap gap-6 mb-8">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-brand-accent" />
                <span className="text-brand-text font-medium">750 Hours</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-brand-accent" />
                <span className="text-brand-text font-medium">~6 Months</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-brand-accent" />
                <span className="text-brand-text font-medium">Financial Aid Available</span>
              </div>
            </div>
            <div className="flex gap-4">
              <Link href="/apply">
                <Button size="lg">Apply Now</Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline">Schedule Tour</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Program Highlights */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <h2 className="text-2xl font-display font-bold text-brand-text mb-6">Program Highlights</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {highlights.map((h) => (
              <div key={h} className="flex items-center gap-2 p-3 rounded-lg bg-brand-elevated">
                <CheckCircle className="w-5 h-5 text-brand-accent shrink-0" />
                <span className="text-sm text-brand-text">{h}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Curriculum */}
      <section className="py-12 px-4 bg-brand-elevated/30">
        <div className="container mx-auto">
          <h2 className="text-2xl font-display font-bold text-brand-text mb-6">Curriculum Overview</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {curriculum.map((c) => (
              <Card key={c.module} className="bg-brand-elevated border-brand-primary/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-brand-text text-lg">{c.module}</CardTitle>
                  <CardDescription className="text-brand-accent font-medium">{c.hours} hours</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1">
                    {c.topics.map((t) => (
                      <li key={t} className="text-sm text-brand-muted flex items-center gap-2">
                        <BookOpen className="w-3.5 h-3.5 text-brand-accent shrink-0" />
                        {t}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-3xl">
          <Card className="bg-brand-elevated border-brand-primary/20">
            <CardHeader>
              <CardTitle className="text-brand-text flex items-center gap-2">
                <Award className="w-5 h-5 text-brand-gold" />
                Admission Requirements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-brand-muted">
                  <CheckCircle className="w-4 h-4 text-brand-accent mt-0.5 shrink-0" />
                  Valid Texas Class A Barber License (or equivalent)
                </li>
                <li className="flex items-start gap-2 text-brand-muted">
                  <CheckCircle className="w-4 h-4 text-brand-accent mt-0.5 shrink-0" />
                  Minimum 1 year of professional barbering experience
                </li>
                <li className="flex items-start gap-2 text-brand-muted">
                  <CheckCircle className="w-4 h-4 text-brand-accent mt-0.5 shrink-0" />
                  High School Diploma or GED
                </li>
                <li className="flex items-start gap-2 text-brand-muted">
                  <CheckCircle className="w-4 h-4 text-brand-accent mt-0.5 shrink-0" />
                  Valid government-issued ID
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Financial Aid */}
      <section className="py-12 px-4 bg-brand-elevated/30">
        <div className="container mx-auto max-w-3xl">
          <Card className="bg-brand-elevated border-brand-primary/20">
            <CardHeader>
              <CardTitle className="text-brand-text flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-brand-accent" />
                Financial Aid & Tuition
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-brand-muted">
                Mystros Barber Academy is approved for Title IV Federal Financial Aid. Eligible students may
                receive Federal Pell Grants, Direct Loans, and other assistance.
              </p>
              <div className="flex items-center gap-2 text-sm text-brand-muted">
                <span className="font-medium text-brand-text">FAFSA School Code:</span> 042609
              </div>
              <div className="flex gap-4">
                <Link href="/financial-aid">
                  <Button variant="outline">Financial Aid Details</Button>
                </Link>
                <Link href="/apply">
                  <Button>Start Your Application</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 text-center">
        <div className="container mx-auto max-w-2xl">
          <h2 className="text-3xl font-display font-bold text-brand-text mb-4">
            Ready to Inspire the Next Generation?
          </h2>
          <p className="text-brand-muted mb-8">
            Turn your barbering skills into a rewarding teaching career. Apply today.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/apply">
              <Button size="lg">Apply Now</Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline">Contact Us</Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
