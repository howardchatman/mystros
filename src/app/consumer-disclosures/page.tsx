import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Users, TrendingUp, DollarSign, Award, ShieldCheck } from "lucide-react";
import { Footer } from "@/components/layout/footer";

export const metadata = {
  title: "Consumer Disclosures | Mystros Barber Academy",
  description: "Consumer information disclosures as required by federal and state regulations.",
};

export default function ConsumerDisclosuresPage() {
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
          <Link href="/" className="text-brand-muted hover:text-brand-text transition-colors text-sm">
            Back to Home
          </Link>
        </div>
      </header>

      <main className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-3xl font-display font-bold text-brand-text mb-4">Consumer Disclosures</h1>
          <p className="text-brand-muted mb-8">
            In compliance with the Higher Education Act, TDLR requirements, and COE accreditation standards,
            Mystros Barber Academy provides the following consumer information.
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            <Card className="bg-brand-elevated border-brand-primary/20">
              <CardHeader>
                <CardTitle className="text-brand-text flex items-center gap-2 text-lg">
                  <Award className="w-5 h-5 text-brand-accent" />
                  Accreditation & Licensure
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-brand-muted space-y-2">
                <p><strong className="text-brand-text">Accredited by:</strong> Council on Occupational Education (COE)</p>
                <p><strong className="text-brand-text">Licensed by:</strong> Texas Department of Licensing and Regulation (TDLR)</p>
                <p><strong className="text-brand-text">FAFSA School Code:</strong> 042609</p>
                <p><strong className="text-brand-text">OPEID:</strong> 042609</p>
              </CardContent>
            </Card>

            <Card className="bg-brand-elevated border-brand-primary/20">
              <CardHeader>
                <CardTitle className="text-brand-text flex items-center gap-2 text-lg">
                  <TrendingUp className="w-5 h-5 text-brand-accent" />
                  Completion & Placement Rates
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-brand-muted space-y-2">
                <p><strong className="text-brand-text">Completion Rate:</strong> Available upon request</p>
                <p><strong className="text-brand-text">Job Placement Rate:</strong> Available upon request</p>
                <p><strong className="text-brand-text">Licensure Pass Rate:</strong> Above 90%</p>
                <p className="text-xs">Rates are calculated per COE/TDLR methodology and updated annually.</p>
              </CardContent>
            </Card>

            <Card className="bg-brand-elevated border-brand-primary/20">
              <CardHeader>
                <CardTitle className="text-brand-text flex items-center gap-2 text-lg">
                  <DollarSign className="w-5 h-5 text-brand-accent" />
                  Cost of Attendance
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-brand-muted space-y-2">
                <p>Tuition and fees vary by program. Detailed cost information is provided in the Enrollment Agreement and includes:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Tuition</li>
                  <li>Registration fee</li>
                  <li>Books and supplies</li>
                  <li>Kit and tools (where applicable)</li>
                </ul>
                <p>Contact admissions for current program-specific pricing.</p>
              </CardContent>
            </Card>

            <Card className="bg-brand-elevated border-brand-primary/20">
              <CardHeader>
                <CardTitle className="text-brand-text flex items-center gap-2 text-lg">
                  <FileText className="w-5 h-5 text-brand-accent" />
                  Financial Aid Information
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-brand-muted space-y-2">
                <p>Mystros Barber Academy participates in Title IV Federal Student Aid programs including:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Federal Pell Grant</li>
                  <li>Federal Direct Subsidized Loans</li>
                  <li>Federal Direct Unsubsidized Loans</li>
                  <li>Federal Direct PLUS Loans (parent)</li>
                </ul>
                <p>
                  <Link href="/financial-aid" className="text-brand-accent hover:underline">
                    View financial aid details
                  </Link>
                </p>
              </CardContent>
            </Card>

            <Card className="bg-brand-elevated border-brand-primary/20">
              <CardHeader>
                <CardTitle className="text-brand-text flex items-center gap-2 text-lg">
                  <Users className="w-5 h-5 text-brand-accent" />
                  Student Rights & Responsibilities
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-brand-muted space-y-2">
                <p>Students have the right to:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Access their education records (FERPA)</li>
                  <li>Receive a fair and transparent refund if withdrawn</li>
                  <li>File complaints with TDLR, COE, or the U.S. Department of Education</li>
                  <li>Receive accommodation for documented disabilities</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-brand-elevated border-brand-primary/20">
              <CardHeader>
                <CardTitle className="text-brand-text flex items-center gap-2 text-lg">
                  <ShieldCheck className="w-5 h-5 text-brand-accent" />
                  Refund Policy
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-brand-muted space-y-2">
                <p>
                  Refunds are calculated in accordance with TDLR regulations and federal Return of Title IV
                  Funds (R2T4) requirements. The refund policy is detailed in the Enrollment Agreement
                  provided at the time of enrollment.
                </p>
                <p>Students who withdraw within the cancellation period receive a full refund of tuition paid.</p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 p-4 rounded-lg bg-brand-elevated border border-brand-primary/20 text-sm text-brand-muted">
            <p>
              <strong className="text-brand-text">Complaint Resolution:</strong> Students may file complaints
              with the Texas Department of Licensing and Regulation (TDLR) at{" "}
              <a href="https://www.tdlr.texas.gov" className="text-brand-accent hover:underline" target="_blank" rel="noopener noreferrer">
                www.tdlr.texas.gov
              </a>{" "}
              or with the Council on Occupational Education (COE) at{" "}
              <a href="https://council.org" className="text-brand-accent hover:underline" target="_blank" rel="noopener noreferrer">
                www.council.org
              </a>.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
