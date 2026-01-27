import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, DollarSign, GraduationCap, CheckCircle, Calendar, Award } from "lucide-react";

export const metadata = {
  title: "Class A Barber Program | Mystros Barber Academy",
  description: "1500-hour Class A Barber program. Complete training for your Texas Barber license.",
};

const curriculum = [
  { module: "Fundamentals", hours: 200, topics: ["Sanitation & Safety", "Tool Handling", "Client Consultation"] },
  { module: "Haircutting Techniques", hours: 400, topics: ["Clipper Cuts", "Scissor Cuts", "Fades & Tapers", "Texturizing"] },
  { module: "Shaving & Facial Hair", hours: 200, topics: ["Straight Razor Shaving", "Beard Design", "Hot Towel Service"] },
  { module: "Chemical Services", hours: 200, topics: ["Hair Coloring", "Relaxers", "Perms"] },
  { module: "Hair & Scalp Treatments", hours: 150, topics: ["Scalp Analysis", "Treatments", "Hair Loss Solutions"] },
  { module: "Business & Career", hours: 150, topics: ["Client Building", "Booth Rental", "Shop Ownership", "Marketing"] },
  { module: "State Board Prep", hours: 200, topics: ["Written Exam Prep", "Practical Exam Prep", "Mock Testing"] },
];

const highlights = [
  "Texas TDLR Licensed Program",
  "COE Accredited",
  "Title IV Financial Aid Eligible",
  "Hands-on Training from Day One",
  "Real Client Experience in Student Salon",
  "Job Placement Assistance",
  "Flexible Day & Evening Schedules",
  "State Board Pass Rate Above 90%",
];

export default function ClassABarberPage() {
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
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 rounded-full bg-brand-accent/20 text-brand-accent text-sm font-medium">
                Most Popular
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-brand-text mb-4">
              Class A Barber Program
            </h1>
            <p className="text-xl text-brand-muted mb-8">
              Our flagship 1500-hour program provides complete training for your Texas Class A Barber license.
              Learn cutting, styling, shaving, and business skills from industry professionals.
            </p>
            <div className="flex flex-wrap gap-6 mb-8">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-brand-accent" />
                <span className="text-brand-text font-medium">1500 Hours</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-brand-accent" />
                <span className="text-brand-text font-medium">10-12 Months</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-brand-gold" />
                <span className="text-brand-text font-medium">$17,500 Tuition</span>
              </div>
            </div>
            <div className="flex gap-4">
              <Link href="/apply">
                <Button size="lg">Apply Now</Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" size="lg">Schedule Tour</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Program Highlights */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-2xl font-display font-bold text-brand-text mb-8">Program Highlights</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {highlights.map((highlight, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-brand-elevated border border-brand-primary/30">
                <CheckCircle className="w-5 h-5 text-brand-accent mt-0.5 flex-shrink-0" />
                <span className="text-brand-text">{highlight}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Curriculum */}
      <section className="py-16 px-4 bg-brand-elevated/50">
        <div className="container mx-auto">
          <h2 className="text-2xl font-display font-bold text-brand-text mb-8">Curriculum Overview</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {curriculum.map((module) => (
              <Card key={module.module} className="bg-brand-elevated border-brand-primary/30">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-brand-text">{module.module}</CardTitle>
                    <span className="text-sm text-brand-accent font-medium">{module.hours} hours</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {module.topics.map((topic, i) => (
                      <li key={i} className="flex items-center gap-2 text-brand-muted">
                        <div className="w-1.5 h-1.5 rounded-full bg-brand-accent" />
                        {topic}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Financial Aid */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <Card className="bg-brand-primary/20 border-brand-accent/30">
            <CardHeader>
              <CardTitle className="text-brand-text flex items-center gap-2">
                <Award className="w-6 h-6 text-brand-gold" />
                Financial Aid Available
              </CardTitle>
              <CardDescription className="text-brand-muted">
                We&apos;re committed to making your education affordable
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-brand-text">
                Mystros Barber Academy is approved to accept Federal Financial Aid.
                Many students qualify for grants that don&apos;t need to be repaid.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="px-4 py-2 rounded-lg bg-brand-elevated border border-brand-primary/30">
                  <span className="text-brand-muted text-sm">FAFSA School Code</span>
                  <p className="text-brand-accent font-bold text-lg">042609</p>
                </div>
                <div className="px-4 py-2 rounded-lg bg-brand-elevated border border-brand-primary/30">
                  <span className="text-brand-muted text-sm">Payment Plans</span>
                  <p className="text-brand-text font-bold text-lg">Available</p>
                </div>
              </div>
              <Link href="/financial-aid">
                <Button variant="outline">Learn About Financial Aid</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-brand-accent/10">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-display font-bold text-brand-text mb-4">
            Ready to Start Your Barbering Career?
          </h2>
          <p className="text-brand-muted mb-8 max-w-2xl mx-auto">
            Join hundreds of successful graduates who have launched their careers at Mystros Barber Academy.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/apply">
              <Button size="lg">Apply Now</Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" size="lg">Contact Admissions</Button>
            </Link>
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
