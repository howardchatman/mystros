import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-brand-primary/20 bg-brand-bg py-12">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Logo & Info */}
          <div className="md:col-span-1">
            <Image
              src="https://static.wixstatic.com/media/4b26b4_de32d7f54cab4f258ce06c39faef6777~mv2.png/v1/fill/w_301,h_301,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/My%20project%20%2813%29.png"
              alt="Mystros Barber Academy"
              width={80}
              height={80}
              className="object-contain"
            />
            <p className="mt-4 text-sm text-brand-muted">
              Houston&apos;s premier barber training institution. COE accredited, TDLR licensed.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-brand-text">Programs</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="/programs/class-a-barber" className="text-brand-muted hover:text-brand-accent">
                  Class A Barber
                </Link>
              </li>
              <li>
                <Link href="/programs/crossover" className="text-brand-muted hover:text-brand-accent">
                  Crossover Program
                </Link>
              </li>
              <li>
                <Link href="/programs/instructor" className="text-brand-muted hover:text-brand-accent">
                  Barber Instructor
                </Link>
              </li>
              <li>
                <Link href="/financial-aid" className="text-brand-muted hover:text-brand-accent">
                  Financial Aid
                </Link>
              </li>
            </ul>
          </div>

          {/* Admissions */}
          <div>
            <h3 className="font-semibold text-brand-text">Admissions</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="/admissions" className="text-brand-muted hover:text-brand-accent">
                  How to Enroll
                </Link>
              </li>
              <li>
                <Link href="/apply" className="text-brand-muted hover:text-brand-accent">
                  Apply Online
                </Link>
              </li>
              <li>
                <Link href="/student-resources" className="text-brand-muted hover:text-brand-accent">
                  Student Resources
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-brand-text">Contact</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li className="text-brand-muted">
                <strong className="text-brand-text">North Campus:</strong>
                <br />
                (832) 286-4248
              </li>
              <li className="text-brand-muted">
                <strong className="text-brand-text">Missouri City:</strong>
                <br />
                (281) 969-7565
              </li>
              <li>
                <a
                  href="mailto:INFOMYSTROSBARBERACADEMY@GMAIL.COM"
                  className="text-brand-muted hover:text-brand-accent break-all"
                >
                  INFOMYSTROSBARBERACADEMY@GMAIL.COM
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-brand-primary/20 pt-8 md:flex-row">
          <p className="text-sm text-brand-muted">
            &copy; {new Date().getFullYear()} Mystros Barber Academy. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm">
            <Link href="/consumer-disclosures" className="text-brand-muted hover:text-brand-accent">
              Consumer Disclosures
            </Link>
            <Link href="/privacy" className="text-brand-muted hover:text-brand-accent">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-brand-muted hover:text-brand-accent">
              Terms
            </Link>
          </div>
        </div>

        <div className="mt-4 text-center text-xs text-brand-muted">
          FAFSA School Code: 042609 | COE Accredited | TDLR Licensed
        </div>
      </div>
    </footer>
  );
}
