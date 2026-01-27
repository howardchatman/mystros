import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, GraduationCap, FileText, CheckCircle, Calculator, HelpCircle, ExternalLink } from "lucide-react";

export const metadata = {
  title: "Financial Aid | Mystros Barber Academy",
  description: "Explore financial aid options at Mystros Barber Academy. Federal grants, loans, and payment plans available.",
};

const aidTypes = [
  {
    title: "Federal Pell Grant",
    description: "Need-based grant that doesn't need to be repaid. Award amounts vary based on financial need.",
    amount: "Up to $7,395/year",
    icon: GraduationCap,
    highlight: true,
  },
  {
    title: "Federal Direct Loans",
    description: "Low-interest loans for students. Repayment begins after you leave school.",
    amount: "Varies by need",
    icon: DollarSign,
    highlight: false,
  },
  {
    title: "Payment Plans",
    description: "Monthly payment options for those who don't qualify for federal aid or need additional coverage.",
    amount: "Flexible terms",
    icon: Calculator,
    highlight: false,
  },
];

const fafsaSteps = [
  { step: 1, title: "Create FSA ID", description: "Create your Federal Student Aid ID at studentaid.gov" },
  { step: 2, title: "Complete FAFSA", description: "Fill out the Free Application for Federal Student Aid" },
  { step: 3, title: "Enter School Code", description: "Use Mystros school code: 042609" },
  { step: 4, title: "Submit & Review", description: "Submit your application and review your Student Aid Report" },
  { step: 5, title: "Accept Aid", description: "Meet with our financial aid office to review and accept your awards" },
];

const faqs = [
  {
    question: "What is the FAFSA school code for Mystros?",
    answer: "Our FAFSA school code is 042609. Enter this code when completing your FAFSA application.",
  },
  {
    question: "Do I need to repay the Pell Grant?",
    answer: "No, the Pell Grant is a federal grant that does not need to be repaid, as long as you maintain satisfactory academic progress.",
  },
  {
    question: "When should I apply for financial aid?",
    answer: "Apply as early as possible. The FAFSA opens October 1st each year. We recommend applying at least 4-6 weeks before your intended start date.",
  },
  {
    question: "What if I don't qualify for federal aid?",
    answer: "We offer flexible payment plans for students who don't qualify for federal aid or need to cover costs not met by their aid package.",
  },
  {
    question: "Can I work while attending school?",
    answer: "Yes! Many of our students work part-time while attending. We offer flexible day and evening schedules to accommodate work.",
  },
];

export default function FinancialAidPage() {
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
      <section className="py-16 px-4 bg-gradient-to-b from-brand-gold/10 to-transparent">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-brand-text mb-4">
            Financial Aid
          </h1>
          <p className="text-xl text-brand-muted max-w-2xl mx-auto mb-6">
            We believe financial barriers shouldn&apos;t stop you from pursuing your dreams.
            Mystros Barber Academy is approved to accept Federal Financial Aid.
          </p>
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-gold/20 border border-brand-gold/30">
            <span className="text-brand-muted">FAFSA School Code:</span>
            <span className="text-brand-gold font-bold text-2xl">042609</span>
          </div>
        </div>
      </section>

      {/* Aid Types */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-2xl font-display font-bold text-brand-text mb-8 text-center">
            Financial Aid Options
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {aidTypes.map((aid) => (
              <Card
                key={aid.title}
                className={`bg-brand-elevated ${aid.highlight ? 'border-brand-gold/50' : 'border-brand-primary/30'}`}
              >
                <CardHeader>
                  <div className={`w-12 h-12 rounded-xl ${aid.highlight ? 'bg-brand-gold/20' : 'bg-brand-accent/20'} flex items-center justify-center mb-4`}>
                    <aid.icon className={`w-6 h-6 ${aid.highlight ? 'text-brand-gold' : 'text-brand-accent'}`} />
                  </div>
                  <CardTitle className="text-brand-text">{aid.title}</CardTitle>
                  <CardDescription className="text-brand-muted">
                    {aid.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className={`text-lg font-bold ${aid.highlight ? 'text-brand-gold' : 'text-brand-accent'}`}>
                    {aid.amount}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAFSA Steps */}
      <section className="py-16 px-4 bg-brand-elevated/50">
        <div className="container mx-auto">
          <h2 className="text-2xl font-display font-bold text-brand-text mb-4 text-center">
            How to Apply for Financial Aid
          </h2>
          <p className="text-brand-muted text-center mb-8 max-w-2xl mx-auto">
            Follow these steps to complete your FAFSA application and receive your financial aid award.
          </p>
          <div className="max-w-3xl mx-auto">
            <div className="space-y-4">
              {fafsaSteps.map((step) => (
                <div
                  key={step.step}
                  className="flex items-start gap-4 p-4 rounded-xl bg-brand-elevated border border-brand-primary/30"
                >
                  <div className="w-10 h-10 rounded-full bg-brand-accent/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-brand-accent font-bold">{step.step}</span>
                  </div>
                  <div>
                    <h3 className="text-brand-text font-semibold">{step.title}</h3>
                    <p className="text-brand-muted text-sm">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 text-center">
              <a
                href="https://studentaid.gov/h/apply-for-aid/fafsa"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2"
              >
                <Button size="lg">
                  Start Your FAFSA
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Cost Breakdown */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-2xl font-display font-bold text-brand-text mb-8 text-center">
            Program Costs
          </h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Card className="bg-brand-elevated border-brand-primary/30">
              <CardHeader>
                <CardTitle className="text-brand-text">Class A Barber Program</CardTitle>
                <CardDescription className="text-brand-muted">1500 hours • 10-12 months</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-brand-muted">Tuition</span>
                    <span className="text-brand-text font-medium">$15,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-muted">Registration Fee</span>
                    <span className="text-brand-text font-medium">$100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-muted">Books & Supplies</span>
                    <span className="text-brand-text font-medium">$2,400</span>
                  </div>
                  <div className="border-t border-brand-primary/30 pt-3 flex justify-between">
                    <span className="text-brand-text font-semibold">Total</span>
                    <span className="text-brand-accent font-bold">$17,500</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-brand-elevated border-brand-primary/30">
              <CardHeader>
                <CardTitle className="text-brand-text">Crossover Program</CardTitle>
                <CardDescription className="text-brand-muted">300 hours • 2-3 months</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-brand-muted">Tuition</span>
                    <span className="text-brand-text font-medium">$3,800</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-muted">Registration Fee</span>
                    <span className="text-brand-text font-medium">$100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-muted">Books & Supplies</span>
                    <span className="text-brand-text font-medium">$600</span>
                  </div>
                  <div className="border-t border-brand-primary/30 pt-3 flex justify-between">
                    <span className="text-brand-text font-semibold">Total</span>
                    <span className="text-brand-accent font-bold">$4,500</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16 px-4 bg-brand-elevated/50">
        <div className="container mx-auto">
          <h2 className="text-2xl font-display font-bold text-brand-text mb-8 text-center">
            Frequently Asked Questions
          </h2>
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, i) => (
              <Card key={i} className="bg-brand-elevated border-brand-primary/30">
                <CardHeader>
                  <CardTitle className="text-brand-text text-base flex items-start gap-2">
                    <HelpCircle className="w-5 h-5 text-brand-accent flex-shrink-0 mt-0.5" />
                    {faq.question}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 pl-9">
                  <p className="text-brand-muted">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-brand-accent/10">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-display font-bold text-brand-text mb-4">
            Questions About Financial Aid?
          </h2>
          <p className="text-brand-muted mb-8 max-w-2xl mx-auto">
            Our financial aid team is here to help you navigate your options and find the best solution for your situation.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/contact">
              <Button size="lg">Contact Financial Aid</Button>
            </Link>
            <Link href="/apply">
              <Button variant="outline" size="lg">Apply Now</Button>
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
