import Link from "next/link";
import { Footer } from "@/components/layout/footer";

export const metadata = {
  title: "Terms of Service | Mystros Barber Academy",
  description: "Terms and conditions for Mystros Barber Academy.",
};

export default function TermsPage() {
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
        <div className="container mx-auto max-w-3xl">
          <h1 className="text-3xl font-display font-bold text-brand-text mb-8">Terms of Service</h1>
          <p className="text-sm text-brand-muted mb-8">Last Updated: January 1, 2025</p>

          <div className="space-y-6 text-brand-muted">
            <section>
              <h2 className="text-xl font-semibold text-brand-text mb-3">1. Enrollment Agreement</h2>
              <p>
                By enrolling at Mystros Barber Academy, students agree to the terms outlined in the
                Enrollment Agreement, which includes program details, tuition costs, refund policies,
                and institutional policies. The Enrollment Agreement is a binding contract between the
                student and the institution.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-brand-text mb-3">2. Attendance Policy</h2>
              <p>
                Students are required to maintain a minimum attendance rate as specified in the student
                handbook. Excessive absences may result in academic probation, suspension, or termination.
                Attendance is tracked via clock-in/clock-out and is reported to regulatory bodies.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-brand-text mb-3">3. Satisfactory Academic Progress (SAP)</h2>
              <p>
                Students must maintain Satisfactory Academic Progress as defined by federal regulations
                and institutional policy. SAP is evaluated at regular intervals and affects financial aid
                eligibility. Students falling below SAP standards will be placed on warning, probation,
                or academic suspension.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-brand-text mb-3">4. Tuition & Refund Policy</h2>
              <p>
                Tuition and fees are outlined in the Enrollment Agreement. The refund policy complies
                with TDLR regulations and federal Return of Title IV Funds requirements. Students who
                withdraw may be entitled to a refund based on the percentage of the program completed.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-brand-text mb-3">5. Code of Conduct</h2>
              <p>
                Students are expected to maintain professional conduct at all times, including proper
                dress code, respectful behavior toward staff and fellow students, and adherence to
                sanitation and safety protocols. Violations may result in disciplinary action up to
                and including dismissal.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-brand-text mb-3">6. Use of Online Portal</h2>
              <p>
                Access to the student portal is provided for academic purposes. Students are responsible
                for maintaining the confidentiality of their login credentials. Unauthorized access or
                misuse of the portal may result in account suspension.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-brand-text mb-3">7. Intellectual Property</h2>
              <p>
                All educational materials, curriculum, and content provided by Mystros Barber Academy
                are proprietary. Students may not reproduce, distribute, or share institutional materials
                without written permission.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-brand-text mb-3">8. Contact</h2>
              <p>
                Questions about these terms should be directed to:{" "}
                <a href="mailto:INFOMYSTROSBARBERACADEMY@GMAIL.COM" className="text-brand-accent hover:underline">
                  INFOMYSTROSBARBERACADEMY@GMAIL.COM
                </a>
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
