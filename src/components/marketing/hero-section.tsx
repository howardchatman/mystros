"use client";

import Image from "next/image";
import Link from "next/link";
import { Phone, Calendar, ArrowRight } from "lucide-react";
import { TextureBackground, GradientText } from "./texture-background";
import { cn } from "@/lib/utils/cn";

interface HeroSectionProps {
  title?: string;
  subtitle?: string;
  description?: string;
  showCTAs?: boolean;
  showLogo?: boolean;
  variant?: "home" | "page";
  className?: string;
}

/**
 * HeroSection Component
 *
 * Full-width hero section with textured background, CTAs, and brand elements.
 * Used on the homepage and can be adapted for interior pages.
 */
export function HeroSection({
  title = "Your Future in Barbering Starts Here",
  subtitle = "Mystros Barber Academy",
  description = "Houston's premier barber training institution. Master the craft with hands-on training, experienced instructors, and financial aid options.",
  showCTAs = true,
  showLogo = true,
  variant = "home",
  className,
}: HeroSectionProps) {
  const isHome = variant === "home";

  return (
    <TextureBackground
      variant="hero"
      withNoise
      withBlueprint
      withGradientSpot
      gradientSpotPosition="top-right"
      className={cn(
        "relative",
        isHome ? "min-h-[90vh] py-20 md:py-32" : "py-16 md:py-24",
        className
      )}
    >
      {/* Secondary gradient spot */}
      <div
        className="pointer-events-none absolute -bottom-32 -left-32 z-0 h-96 w-96 rounded-full bg-brand-gold/5 blur-3xl"
        aria-hidden="true"
      />

      <div className="container-wide relative z-10">
        <div className="mx-auto max-w-4xl text-center">
          {/* Floating Logo */}
          {showLogo && isHome && (
            <div className="mb-8 flex justify-center animate-float">
              <div className="relative h-32 w-32 md:h-40 md:w-40">
                <Image
                  src="https://static.wixstatic.com/media/4b26b4_de32d7f54cab4f258ce06c39faef6777~mv2.png/v1/fill/w_301,h_301,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/My%20project%20%2813%29.png"
                  alt="Mystros Barber Academy Shield Logo"
                  fill
                  className="object-contain drop-shadow-2xl"
                  priority
                />
              </div>
            </div>
          )}

          {/* Eyebrow */}
          {isHome && (
            <p className="section-eyebrow mb-4">
              COE Accredited • TDLR Licensed • Title IV Eligible
            </p>
          )}

          {/* Subtitle */}
          {subtitle && (
            <p className="mb-2 text-lg font-semibold text-brand-accent md:text-xl">
              {subtitle}
            </p>
          )}

          {/* Main Title */}
          <h1
            className={cn(
              "font-display font-bold tracking-tight text-brand-text",
              isHome
                ? "text-4xl md:text-5xl lg:text-6xl xl:text-7xl"
                : "text-3xl md:text-4xl lg:text-5xl"
            )}
          >
            {title.includes("Barbering") ? (
              <>
                Your Future in{" "}
                <GradientText>Barbering</GradientText>
                <br />
                Starts Here
              </>
            ) : (
              title
            )}
          </h1>

          {/* Description */}
          {description && (
            <p className="mx-auto mt-6 max-w-2xl text-lg text-brand-muted md:text-xl">
              {description}
            </p>
          )}

          {/* CTAs */}
          {showCTAs && (
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/apply"
                className="btn-cta group w-full sm:w-auto"
              >
                Apply Now
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                href="/admissions#schedule-tour"
                className="btn-secondary w-full sm:w-auto"
              >
                <Calendar className="h-4 w-4" />
                Schedule a Tour
              </Link>

              <a
                href="tel:8322864248"
                className="btn-outline w-full sm:w-auto"
              >
                <Phone className="h-4 w-4" />
                (832) 286-4248
              </a>
            </div>
          )}

          {/* Trust indicators */}
          {isHome && (
            <div className="mt-16 flex flex-wrap items-center justify-center gap-6 text-sm text-brand-muted">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <span>Now Enrolling</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-brand-ice">500+</span>
                <span>Graduates</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-brand-ice">92%</span>
                <span>Graduation Rate</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-brand-ice">88%</span>
                <span>Job Placement</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom fade */}
      {isHome && (
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-brand-bg to-transparent" />
      )}
    </TextureBackground>
  );
}

/**
 * PageHero Component
 *
 * Simpler hero for interior pages
 */
interface PageHeroProps {
  title: string;
  description?: string;
  breadcrumbs?: { label: string; href?: string }[];
  className?: string;
}

export function PageHero({
  title,
  description,
  breadcrumbs,
  className,
}: PageHeroProps) {
  return (
    <TextureBackground
      variant="section"
      withNoise
      className={cn("py-12 md:py-16", className)}
    >
      <div className="container-wide">
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="mb-4 text-sm" aria-label="Breadcrumb">
            <ol className="flex items-center gap-2 text-brand-muted">
              {breadcrumbs.map((crumb, index) => (
                <li key={crumb.label} className="flex items-center gap-2">
                  {index > 0 && <span>/</span>}
                  {crumb.href ? (
                    <Link
                      href={crumb.href}
                      className="hover:text-brand-accent transition-colors"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-brand-text">{crumb.label}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}

        {/* Title */}
        <h1 className="section-heading">{title}</h1>

        {/* Description */}
        {description && (
          <p className="mt-4 section-subheading">{description}</p>
        )}
      </div>
    </TextureBackground>
  );
}
