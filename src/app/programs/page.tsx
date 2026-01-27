import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, DollarSign, GraduationCap, Scissors } from "lucide-react";

export const metadata = {
  title: "Programs",
  description: "Explore our barbering programs at Mystros Barber Academy",
};

const programs = [
  {
    name: "Class A Barber",
    code: "CLASS-A",
    hours: 1500,
    description: "Complete barbering training for Texas Class A Barber license. Learn cutting, styling, shaving, and business skills.",
    tuition: 17500,
    duration: "10-12 months",
    icon: Scissors,
  },
  {
    name: "Barber Crossover",
    code: "CROSSOVER",
    hours: 300,
    description: "For licensed cosmetologists looking to add barbering to their skills. Fast-track to your barber license.",
    tuition: 4500,
    duration: "2-3 months",
    icon: GraduationCap,
  },
  {
    name: "Barber Instructor",
    code: "INSTRUCTOR",
    hours: 750,
    description: "Train to become a licensed barber instructor. Teach the next generation of barbers.",
    tuition: 8500,
    duration: "5-6 months",
    icon: GraduationCap,
  },
];

export default function ProgramsPage() {
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
            Our Programs
          </h1>
          <p className="text-xl text-brand-muted max-w-2xl mx-auto">
            Start your barbering career with accredited programs designed to get you licensed and working.
          </p>
        </div>
      </section>

      {/* Programs Grid */}
      <section className="pb-20 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.map((program) => (
              <Card key={program.code} className="bg-brand-elevated border-brand-primary/30 hover:border-brand-accent/50 transition-colors">
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-brand-accent/20 flex items-center justify-center mb-4">
                    <program.icon className="w-6 h-6 text-brand-accent" />
                  </div>
                  <CardTitle className="text-brand-text">{program.name}</CardTitle>
                  <CardDescription className="text-brand-muted">
                    {program.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-brand-accent" />
                      <span className="text-brand-muted">{program.hours} hours</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="w-4 h-4 text-brand-gold" />
                      <span className="text-brand-muted">${program.tuition.toLocaleString()}</span>
                    </div>
                  </div>
                  <p className="text-sm text-brand-ice">Duration: {program.duration}</p>
                  <Link href="/apply" className="block">
                    <Button className="w-full">Apply for {program.name}</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-brand-primary/20">
        <div className="container mx-auto text-center">
          <h2 className="text-2xl font-display font-bold text-brand-text mb-4">
            Ready to Start Your Career?
          </h2>
          <p className="text-brand-muted mb-6">
            Financial aid available for those who qualify. FAFSA Code: 042609
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/apply">
              <Button size="lg">Apply Now</Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" size="lg">Contact Us</Button>
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
