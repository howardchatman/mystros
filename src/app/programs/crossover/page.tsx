import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, DollarSign, CheckCircle, Calendar, Award, Zap } from "lucide-react";

export const metadata = {
  title: "Barber Crossover Program | Mystros Barber Academy",
  description: "300-hour Crossover program for licensed cosmetologists. Fast-track to your Texas Barber license.",
};

const curriculum = [
  { module: "Barbering Fundamentals", hours: 50, topics: ["Barber History & Culture", "Sanitation for Barbering", "Tool Differences"] },
  { module: "Clipper Techniques", hours: 100, topics: ["Clipper Over Comb", "Fades & Tapers", "Bald Fades", "Skin Fades"] },
  { module: "Shaving Services", hours: 75, topics: ["Straight Razor Handling", "Hot Towel Shaves", "Beard Shaping", "Facial Hair Design"] },
  { module: "Men's Styling", hours: 50, topics: ["Modern Men's Cuts", "Classic Styles", "Texture & Styling Products"] },
  { module: "State Board Prep", hours: 25, topics: ["Barber-Specific Requirements", "Practical Exam Prep", "Written Exam Review"] },
];

const highlights = [
  "Only 300 Hours Required",
  "For Licensed Cosmetologists",
  "Complete in 2-3 Months",
  "Flexible Scheduling",
  "Hands-on Clipper Training",
  "Straight Razor Certification",
  "State Board Prep Included",
  "Add Barbering to Your Services",
];

const requirements = [
  "Valid Texas Cosmetology License (or equivalent from another state)",
  "High School Diploma or GED",
  "Valid government-issued ID",
  "Proof of cosmetology license in good standing",
];

export default function CrossoverPage() {
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
      <section className="py-16 px-4 bg-gradient-to-b from-brand-accent/10 to-transparent">
        <div className="container mx-auto">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 rounded-full bg-brand-gold/20 text-brand-gold text-sm font-medium">
                <Zap className="w-4 h-4 inline mr-1" />
                Fast Track
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-brand-text mb-4">
              Barber Crossover Program
            </h1>
            <p className="text-xl text-brand-muted mb-8">
              Already a licensed cosmetologist? Our 300-hour crossover program fast-tracks you to your
              Texas Barber license. Master clipper fades, straight razor shaving, and men&apos;s styling.
            </p>
            <div className="flex flex-wrap gap-6 mb-8">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-brand-accent" />
                <span className="text-brand-text font-medium">300 Hours</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-brand-accent" />
                <span className="text-brand-text font-medium">2-3 Months</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-brand-gold" />
                <span className="text-brand-text font-medium">$4,500 Tuition</span>
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

      {/* Requirements */}
      <section className="py-16 px-4 bg-brand-elevated/50">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-display font-bold text-brand-text mb-6">Eligibility Requirements</h2>
              <Card className="bg-brand-elevated border-brand-primary/30">
                <CardContent className="pt-6">
                  <ul className="space-y-4">
                    {requirements.map((req, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-brand-accent mt-0.5 flex-shrink-0" />
                        <span className="text-brand-text">{req}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
            <div>
              <h2 className="text-2xl font-display font-bold text-brand-text mb-6">Why Crossover?</h2>
              <Card className="bg-brand-elevated border-brand-primary/30">
                <CardContent className="pt-6 space-y-4">
                  <p className="text-brand-muted">
                    Adding a barber license to your cosmetology credentials opens new opportunities:
                  </p>
                  <ul className="space-y-3 text-brand-text">
                    <li className="flex items-start gap-2">
                      <span className="text-brand-gold">•</span>
                      Serve a broader clientele
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-brand-gold">•</span>
                      Work in barbershops or salons
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-brand-gold">•</span>
                      Increase your earning potential
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-brand-gold">•</span>
                      Master high-demand fade techniques
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-brand-gold">•</span>
                      Offer straight razor services
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Curriculum */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-2xl font-display font-bold text-brand-text mb-8">Curriculum Overview</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {curriculum.map((module) => (
              <Card key={module.module} className="bg-brand-elevated border-brand-primary/30">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-brand-text text-lg">{module.module}</CardTitle>
                    <span className="text-sm text-brand-accent font-medium">{module.hours} hrs</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {module.topics.map((topic, i) => (
                      <li key={i} className="flex items-center gap-2 text-brand-muted text-sm">
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
      <section className="py-16 px-4 bg-brand-elevated/50">
        <div className="container mx-auto">
          <Card className="bg-brand-primary/20 border-brand-accent/30">
            <CardHeader>
              <CardTitle className="text-brand-text flex items-center gap-2">
                <Award className="w-6 h-6 text-brand-gold" />
                Payment Options
              </CardTitle>
              <CardDescription className="text-brand-muted">
                Flexible payment plans available
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-brand-text">
                While the crossover program is shorter and more affordable, we still offer payment plans
                to help you manage the cost of your education.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="px-4 py-2 rounded-lg bg-brand-elevated border border-brand-primary/30">
                  <span className="text-brand-muted text-sm">Total Tuition</span>
                  <p className="text-brand-accent font-bold text-lg">$4,500</p>
                </div>
                <div className="px-4 py-2 rounded-lg bg-brand-elevated border border-brand-primary/30">
                  <span className="text-brand-muted text-sm">Payment Plans</span>
                  <p className="text-brand-text font-bold text-lg">Available</p>
                </div>
              </div>
              <Link href="/contact">
                <Button variant="outline">Contact Admissions</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-brand-accent/10">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-display font-bold text-brand-text mb-4">
            Ready to Add Barbering to Your Skills?
          </h2>
          <p className="text-brand-muted mb-8 max-w-2xl mx-auto">
            Take the next step in your career. Join our crossover program and become a dual-licensed professional.
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
