import Link from "next/link";
import { Footer } from "@/components/layout/footer";

export const metadata = {
  title: "Privacy Policy | Mystros Barber Academy",
  description: "Privacy policy for Mystros Barber Academy.",
};

export default function PrivacyPage() {
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
        <div className="container mx-auto max-w-3xl prose prose-invert prose-brand">
          <h1 className="text-3xl font-display font-bold text-brand-text mb-8">Privacy Policy</h1>
          <p className="text-sm text-brand-muted mb-8">Effective Date: January 1, 2025</p>

          <section className="space-y-6 text-brand-muted">
            <div>
              <h2 className="text-xl font-semibold text-brand-text mb-3">1. Information We Collect</h2>
              <p>Mystros Barber Academy collects personal information necessary to provide educational services, including:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Name, date of birth, and contact information</li>
                <li>Social Security Number (for financial aid processing)</li>
                <li>Educational history and transcripts</li>
                <li>Financial information for tuition and aid purposes</li>
                <li>Attendance and academic performance records</li>
                <li>Government-issued identification documents</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-brand-text mb-3">2. How We Use Your Information</h2>
              <p>We use collected information to:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Process admissions applications and enrollment</li>
                <li>Administer financial aid (Title IV, Pell Grants, Direct Loans)</li>
                <li>Track academic progress, attendance, and SAP compliance</li>
                <li>Communicate about schedules, grades, and institutional updates</li>
                <li>Report to accrediting bodies (COE) and state regulators (TDLR)</li>
                <li>Comply with federal and state educational regulations</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-brand-text mb-3">3. FERPA Rights</h2>
              <p>
                Under the Family Educational Rights and Privacy Act (FERPA), students have the right to inspect their
                education records, request amendments, and control disclosure of personally identifiable information.
                Requests should be submitted in writing to the campus Registrar.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-brand-text mb-3">4. Information Sharing</h2>
              <p>We do not sell personal information. We may share information with:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>U.S. Department of Education (financial aid administration)</li>
                <li>Texas Department of Licensing and Regulation (TDLR)</li>
                <li>Council on Occupational Education (COE) for accreditation</li>
                <li>Third-party servicers for financial aid processing</li>
                <li>Law enforcement when required by law</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-brand-text mb-3">5. Data Security</h2>
              <p>
                We implement appropriate technical and organizational measures to protect personal information,
                including encrypted data storage, role-based access controls, and secure transmission protocols.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-brand-text mb-3">6. Contact Us</h2>
              <p>
                For questions about this privacy policy or to exercise your FERPA rights, contact us at:{" "}
                <a href="mailto:INFOMYSTROSBARBERACADEMY@GMAIL.COM" className="text-brand-accent hover:underline">
                  INFOMYSTROSBARBERACADEMY@GMAIL.COM
                </a>
              </p>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
