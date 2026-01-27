import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MapPin, Clock } from "lucide-react";

export const metadata = {
  title: "Contact Us",
  description: "Get in touch with Mystros Barber Academy",
};

export default function ContactPage() {
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
            Contact Us
          </h1>
          <p className="text-xl text-brand-muted max-w-2xl mx-auto">
            Have questions? We&apos;re here to help you start your barbering career.
          </p>
        </div>
      </section>

      {/* Contact Info */}
      <section className="pb-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-brand-elevated border-brand-primary/30">
              <CardHeader>
                <CardTitle className="text-brand-text flex items-center gap-2">
                  <Phone className="w-5 h-5 text-brand-accent" />
                  Call Us
                </CardTitle>
                <CardDescription className="text-brand-muted">
                  Speak with an admissions counselor
                </CardDescription>
              </CardHeader>
              <CardContent>
                <a
                  href="tel:+17139992904"
                  className="text-2xl font-bold text-brand-accent hover:text-brand-accent2 transition-colors"
                >
                  (713) 999-2904
                </a>
                <p className="text-sm text-brand-muted mt-2">
                  Monday - Friday: 9am - 6pm
                </p>
              </CardContent>
            </Card>

            <Card className="bg-brand-elevated border-brand-primary/30">
              <CardHeader>
                <CardTitle className="text-brand-text flex items-center gap-2">
                  <Mail className="w-5 h-5 text-brand-accent" />
                  Email Us
                </CardTitle>
                <CardDescription className="text-brand-muted">
                  Get a response within 24 hours
                </CardDescription>
              </CardHeader>
              <CardContent>
                <a
                  href="mailto:info@mystrosbarber.com"
                  className="text-xl font-bold text-brand-accent hover:text-brand-accent2 transition-colors"
                >
                  info@mystrosbarber.com
                </a>
              </CardContent>
            </Card>

            <Card className="bg-brand-elevated border-brand-primary/30">
              <CardHeader>
                <CardTitle className="text-brand-text flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-brand-accent" />
                  Visit Us
                </CardTitle>
                <CardDescription className="text-brand-muted">
                  Tour our campus
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-brand-text">
                  Mystros Barber Academy<br />
                  Houston, TX
                </p>
              </CardContent>
            </Card>

            <Card className="bg-brand-elevated border-brand-primary/30">
              <CardHeader>
                <CardTitle className="text-brand-text flex items-center gap-2">
                  <Clock className="w-5 h-5 text-brand-accent" />
                  Hours
                </CardTitle>
                <CardDescription className="text-brand-muted">
                  Office and class schedules
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-1 text-brand-text">
                <p>Mon - Fri: 8:30am - 9:00pm</p>
                <p>Saturday: 9:00am - 3:00pm</p>
                <p>Sunday: Closed</p>
              </CardContent>
            </Card>
          </div>

          {/* CTA */}
          <div className="mt-12 text-center">
            <h2 className="text-2xl font-display font-bold text-brand-text mb-4">
              Ready to Get Started?
            </h2>
            <div className="flex gap-4 justify-center">
              <Link href="/apply">
                <Button size="lg">Apply Now</Button>
              </Link>
              <Link href="/programs">
                <Button variant="outline" size="lg">View Programs</Button>
              </Link>
            </div>
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
