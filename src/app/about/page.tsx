import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award, Users, Target, Heart, CheckCircle, MapPin } from "lucide-react";

export const metadata = {
  title: "About Us | Mystros Barber Academy",
  description: "Learn about Mystros Barber Academy, our mission, values, and commitment to training the next generation of barbers.",
};

const values = [
  {
    title: "Excellence",
    description: "We maintain the highest standards in education and training, preparing students to exceed industry expectations.",
    icon: Award,
  },
  {
    title: "Community",
    description: "We build a supportive environment where students learn from each other and form lasting professional connections.",
    icon: Users,
  },
  {
    title: "Innovation",
    description: "We stay current with industry trends and techniques, ensuring our curriculum reflects modern barbering.",
    icon: Target,
  },
  {
    title: "Integrity",
    description: "We operate with honesty and transparency in everything we do, from enrollment to graduation.",
    icon: Heart,
  },
];

const accreditations = [
  { name: "COE Accredited", description: "Council on Occupational Education" },
  { name: "TDLR Licensed", description: "Texas Department of Licensing and Regulation" },
  { name: "Title IV Eligible", description: "Approved for Federal Financial Aid" },
  { name: "VA Approved", description: "Approved for Veterans Benefits" },
];

const stats = [
  { value: "500+", label: "Graduates" },
  { value: "90%+", label: "State Board Pass Rate" },
  { value: "95%", label: "Job Placement Rate" },
  { value: "15+", label: "Years of Excellence" },
];

export default function AboutPage() {
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
        <div className="container mx-auto">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-brand-text mb-4">
              About Mystros Barber Academy
            </h1>
            <p className="text-xl text-brand-muted mb-8">
              We are dedicated to training the next generation of professional barbers,
              combining traditional techniques with modern innovation to prepare our students
              for successful careers in the barbering industry.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-4 bg-brand-accent/10">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-display font-bold text-brand-accent mb-1">
                  {stat.value}
                </div>
                <div className="text-brand-muted text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl font-display font-bold text-brand-text mb-4">Our Mission</h2>
              <p className="text-brand-muted mb-6">
                At Mystros Barber Academy, our mission is to provide comprehensive, hands-on training
                that prepares students for successful careers in the barbering industry. We believe
                in developing not just technical skills, but the professionalism, business acumen,
                and client service abilities that set our graduates apart.
              </p>
              <p className="text-brand-muted">
                Located in Houston, Texas, we serve students from across the region who are ready
                to transform their passion for barbering into a rewarding career. Our experienced
                instructors bring real-world expertise to the classroom, ensuring students learn
                the techniques and trends that matter most in today&apos;s market.
              </p>
            </div>
            <Card className="bg-brand-elevated border-brand-primary/30">
              <CardHeader>
                <CardTitle className="text-brand-text flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-brand-accent" />
                  Our Campus
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-brand-text">
                  Mystros Barber Academy<br />
                  Houston, Texas
                </p>
                <p className="text-brand-muted text-sm">
                  Our modern facility features professional-grade equipment, a student salon
                  for real-world experience, and comfortable classroom spaces designed for
                  optimal learning.
                </p>
                <Link href="/contact">
                  <Button variant="outline" className="w-full">Schedule a Campus Tour</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 px-4 bg-brand-elevated/50">
        <div className="container mx-auto">
          <h2 className="text-2xl font-display font-bold text-brand-text mb-8 text-center">
            Our Values
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value) => (
              <Card key={value.title} className="bg-brand-elevated border-brand-primary/30">
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-brand-accent/20 flex items-center justify-center mb-4">
                    <value.icon className="w-6 h-6 text-brand-accent" />
                  </div>
                  <CardTitle className="text-brand-text">{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-brand-muted text-sm">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Accreditations */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-2xl font-display font-bold text-brand-text mb-8 text-center">
            Accreditations & Approvals
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {accreditations.map((acc) => (
              <div
                key={acc.name}
                className="flex items-start gap-3 p-4 rounded-xl bg-brand-elevated border border-brand-primary/30"
              >
                <CheckCircle className="w-5 h-5 text-brand-gold mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-brand-text font-medium block">{acc.name}</span>
                  <span className="text-brand-muted text-sm">{acc.description}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 px-4 bg-brand-elevated/50">
        <div className="container mx-auto">
          <h2 className="text-2xl font-display font-bold text-brand-text mb-8 text-center">
            Why Choose Mystros?
          </h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Card className="bg-brand-elevated border-brand-primary/30">
              <CardContent className="pt-6">
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-brand-accent mt-0.5 flex-shrink-0" />
                    <span className="text-brand-text">Hands-on training from day one</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-brand-accent mt-0.5 flex-shrink-0" />
                    <span className="text-brand-text">Experienced, licensed instructors</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-brand-accent mt-0.5 flex-shrink-0" />
                    <span className="text-brand-text">Modern facility with professional equipment</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-brand-accent mt-0.5 flex-shrink-0" />
                    <span className="text-brand-text">Real client experience in student salon</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            <Card className="bg-brand-elevated border-brand-primary/30">
              <CardContent className="pt-6">
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-brand-accent mt-0.5 flex-shrink-0" />
                    <span className="text-brand-text">Financial aid available for those who qualify</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-brand-accent mt-0.5 flex-shrink-0" />
                    <span className="text-brand-text">Flexible day and evening schedules</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-brand-accent mt-0.5 flex-shrink-0" />
                    <span className="text-brand-text">Job placement assistance</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-brand-accent mt-0.5 flex-shrink-0" />
                    <span className="text-brand-text">Comprehensive state board preparation</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-brand-accent/10">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-display font-bold text-brand-text mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-brand-muted mb-8 max-w-2xl mx-auto">
            Join the Mystros family and take the first step toward your barbering career.
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
