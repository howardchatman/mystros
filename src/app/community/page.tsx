import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Heart, Trophy, Star } from "lucide-react";
import { Footer } from "@/components/layout/footer";

export const metadata = {
  title: "Community | Mystros Barber Academy",
  description: "See the impact Mystros Barber Academy has on our students and the Houston community.",
};

const highlights = [
  {
    stat: "500+",
    label: "Graduates",
    description: "Licensed barbers serving communities across Texas.",
  },
  {
    stat: "90%+",
    label: "State Board Pass Rate",
    description: "Our graduates consistently pass the Texas barber exam.",
  },
  {
    stat: "2",
    label: "Campus Locations",
    description: "Serving the greater Houston area from North Houston and Missouri City.",
  },
  {
    stat: "15+",
    label: "Years of Excellence",
    description: "A legacy of training skilled, professional barbers.",
  },
];

const testimonials = [
  {
    name: "Marcus J.",
    role: "Class A Barber Graduate",
    quote: "Mystros gave me the foundation I needed to open my own shop. The instructors treat you like family.",
  },
  {
    name: "David R.",
    role: "Crossover Graduate",
    quote: "As a cosmetologist, the crossover program was exactly what I needed. In just a few months I had my barber license.",
  },
  {
    name: "Anthony W.",
    role: "Class A Barber Graduate",
    quote: "The hands-on training from day one sets Mystros apart. I was working on real clients within weeks.",
  },
];

export default function CommunityPage() {
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
            <Link href="/programs" className="text-brand-muted hover:text-brand-text transition-colors text-sm">
              Programs
            </Link>
            <Link href="/login" className="text-brand-muted hover:text-brand-text transition-colors text-sm">
              Sign In
            </Link>
            <Link href="/apply">
              <Button size="sm">Apply Now</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="py-16 px-4 bg-gradient-to-b from-brand-primary/20 to-transparent">
          <div className="container mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-display font-bold text-brand-text mb-4">Our Community</h1>
            <p className="text-lg text-brand-muted">
              Mystros Barber Academy is more than a school — it&apos;s a community of skilled professionals
              dedicated to excellence in the barbering craft and making an impact in Houston.
            </p>
          </div>
        </section>

        {/* Impact Stats */}
        <section className="py-12 px-4">
          <div className="container mx-auto">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {highlights.map((h) => (
                <Card key={h.label} className="bg-brand-elevated border-brand-primary/20 text-center">
                  <CardContent className="pt-6">
                    <p className="text-3xl font-bold text-brand-accent mb-1">{h.stat}</p>
                    <p className="text-brand-text font-medium mb-1">{h.label}</p>
                    <p className="text-xs text-brand-muted">{h.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Community Involvement */}
        <section className="py-12 px-4 bg-brand-elevated/30">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-2xl font-display font-bold text-brand-text mb-6 flex items-center gap-2">
              <Heart className="w-6 h-6 text-brand-accent" />
              Giving Back
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Card className="bg-brand-elevated border-brand-primary/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-brand-text text-lg">Free Community Cuts</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-brand-muted">
                  Our students provide free haircuts to underserved community members as part of their
                  practical training, giving back while building real-world skills.
                </CardContent>
              </Card>
              <Card className="bg-brand-elevated border-brand-primary/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-brand-text text-lg">Career Pathways</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-brand-muted">
                  We work with local barbershops and salons to create employment opportunities for
                  our graduates, strengthening the local economy.
                </CardContent>
              </Card>
              <Card className="bg-brand-elevated border-brand-primary/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-brand-text text-lg">Youth Mentorship</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-brand-muted">
                  Our instructors and advanced students mentor high school youth interested in
                  barbering as a career, providing guidance and inspiration.
                </CardContent>
              </Card>
              <Card className="bg-brand-elevated border-brand-primary/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-brand-text text-lg">Industry Partnerships</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-brand-muted">
                  We partner with leading brands and barbershop owners to host workshops,
                  guest lectures, and networking events for our students.
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-12 px-4">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-2xl font-display font-bold text-brand-text mb-6 flex items-center gap-2">
              <Star className="w-6 h-6 text-brand-gold" />
              Student Stories
            </h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {testimonials.map((t) => (
                <Card key={t.name} className="bg-brand-elevated border-brand-primary/20">
                  <CardContent className="pt-6">
                    <p className="text-sm text-brand-muted italic mb-4">&ldquo;{t.quote}&rdquo;</p>
                    <p className="text-brand-text font-medium text-sm">{t.name}</p>
                    <p className="text-xs text-brand-muted">{t.role}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-4 text-center">
          <div className="container mx-auto max-w-2xl">
            <h2 className="text-3xl font-display font-bold text-brand-text mb-4">
              Join the Mystros Family
            </h2>
            <p className="text-brand-muted mb-8">
              Start your journey toward a rewarding career in barbering today.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/apply">
                <Button size="lg">Apply Now</Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline">Schedule a Tour</Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
