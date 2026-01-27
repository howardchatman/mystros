"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Phone, Calendar, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";


// Hero slideshow images
const HERO_IMAGES = [
  "/mystros_hero_images/1.png",
  "/mystros_hero_images/2.png",
  "/mystros_hero_images/3.png",
  "/mystros_hero_images/4.png",
  "/mystros_hero_images/5.png",
  "/mystros_hero_images/6.png",
];

interface HeroSectionV2Props {
  className?: string;
}

/**
 * Modern Hero Section with Background Image
 *
 * Features:
 * - Background image with Ken Burns zoom effect
 * - Animated gradient text with typewriter cycling
 * - Glassmorphism floating cards
 * - Smooth entrance animations
 */
export function HeroSectionV2({ className }: HeroSectionV2Props) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  // Image slideshow cycling
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Trigger entrance animations after mount
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className={cn("relative min-h-screen overflow-hidden", className)}>
      {/* Image Slideshow Background */}
      <div className="absolute inset-0 z-0">
        {/* Slideshow images with crossfade */}
        {HERO_IMAGES.map((src, index) => (
          <div
            key={src}
            className={cn(
              "absolute inset-0 transition-opacity duration-1000",
              index === currentImageIndex ? "opacity-100" : "opacity-0"
            )}
          >
            <Image
              src={src}
              alt={`Mystros Barber Academy ${index + 1}`}
              fill
              className="object-cover"
              priority={index === 0}
              sizes="100vw"
            />
          </div>
        ))}

        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-brand-bg/70 via-brand-bg/50 to-brand-bg/90" />

        {/* Animated gradient orbs for extra flair */}
        <div className="absolute -top-20 -left-20 h-[400px] w-[400px] rounded-full bg-blue-600/20 blur-[100px] animate-glow-pulse" />
        <div className="absolute -bottom-20 -right-20 h-[500px] w-[500px] rounded-full bg-brand-primary/30 blur-[120px] animate-glow-pulse" style={{ animationDelay: '1.5s' }} />
      </div>


      {/* Main Content */}
      <div className="container-wide relative z-10 flex min-h-screen flex-col items-center justify-center py-20">
        {/* Logo with glow */}
        <div
          className={cn(
            "mb-8 transition-all duration-1000",
            isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          )}
        >
          <div className="relative">
            {/* Glow effect behind logo */}
            <div className="absolute inset-0 scale-150 blur-3xl opacity-50">
              <div className="h-full w-full rounded-full bg-gradient-to-r from-brand-accent/50 to-brand-primary/50" />
            </div>
            <div className="relative h-36 w-36 md:h-44 md:w-44 rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
              <Image
                src="https://static.wixstatic.com/media/4b26b4_de32d7f54cab4f258ce06c39faef6777~mv2.png/v1/fill/w_301,h_301,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/My%20project%20%2813%29.png"
                alt="Mystros Barber Academy Shield Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>

        {/* Eyebrow badges */}
        <div
          className={cn(
            "mb-6 flex flex-wrap justify-center gap-3 transition-all duration-1000 delay-100",
            isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          )}
        >
          <span className="rounded-full bg-white/10 backdrop-blur-md px-4 py-1.5 text-xs font-medium text-white/90 border border-white/20">
            COE Accredited
          </span>
          <span className="rounded-full bg-white/10 backdrop-blur-md px-4 py-1.5 text-xs font-medium text-white/90 border border-white/20">
            TDLR Licensed
          </span>
          <span className="rounded-full bg-brand-accent/20 backdrop-blur-md px-4 py-1.5 text-xs font-medium text-brand-accent border border-brand-accent/30">
            Title IV Eligible
          </span>
        </div>

        {/* Academy Name */}
        <p
          className={cn(
            "mb-2 text-lg font-semibold text-brand-accent md:text-xl transition-all duration-1000 delay-200",
            isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          )}
        >
          Mystros Barber Academy
        </p>

        {/* Main Headline */}
        <h1
          className={cn(
            "text-center font-display font-bold tracking-tight transition-all duration-1000 delay-300",
            "text-4xl md:text-5xl lg:text-6xl xl:text-7xl",
            isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          )}
        >
          <span className="text-brand-text">Your Future in</span>
          <br />
          <span className="bg-gradient-to-r from-brand-accent via-brand-ice to-brand-accent2 bg-[length:200%_auto] bg-clip-text text-transparent animate-text-shimmer">
            Excellence
          </span>
          <br />
          <span className="text-brand-text">Starts Here</span>
        </h1>

        {/* Description */}
        <p
          className={cn(
            "mx-auto mt-6 max-w-2xl text-center text-lg text-brand-muted md:text-xl transition-all duration-1000 delay-[400ms]",
            isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          )}
        >
          Houston&apos;s premier barber training institution. Master the craft with
          hands-on training, experienced instructors, and financial aid options.
        </p>

        {/* CTA Buttons */}
        <div
          className={cn(
            "mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row transition-all duration-1000 delay-500",
            isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          )}
        >
          <Link
            href="/apply"
            className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-brand-accent to-brand-accent2 px-8 py-4 font-semibold text-white shadow-glow-md transition-all hover:shadow-glow-lg hover:scale-105 sm:w-auto"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              Apply Now
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-brand-accent2 to-brand-accent opacity-0 transition-opacity group-hover:opacity-100" />
          </Link>

          <Link
            href="/admissions#schedule-tour"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-8 py-4 font-semibold text-white backdrop-blur-md transition-all hover:bg-white/20 hover:border-white/30 sm:w-auto"
          >
            <Calendar className="h-4 w-4" />
            Schedule a Tour
          </Link>

          <a
            href="tel:8322864248"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-brand-accent/30 bg-brand-accent/10 px-8 py-4 font-semibold text-brand-accent backdrop-blur-md transition-all hover:bg-brand-accent/20 hover:border-brand-accent/50 sm:w-auto"
          >
            <Phone className="h-4 w-4" />
            (832) 286-4248
          </a>
        </div>

        {/* Floating Stats Cards */}
        <div
          className={cn(
            "mt-16 grid w-full max-w-4xl grid-cols-2 gap-4 md:grid-cols-4 transition-all duration-1000 delay-700",
            isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          )}
        >
          <StatCard number="500+" label="Graduates" delay={0} />
          <StatCard number="92%" label="Graduation Rate" delay={100} />
          <StatCard number="88%" label="Job Placement" delay={200} />
          <StatCard number="15+" label="Years Excellence" delay={300} />
        </div>

        {/* Now Enrolling Badge */}
        <div
          className={cn(
            "mt-8 transition-all duration-1000 delay-[900ms]",
            isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          )}
        >
          <div className="flex items-center gap-2 rounded-full bg-emerald-500/20 px-4 py-2 border border-emerald-500/30">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
            </span>
            <span className="text-sm font-medium text-emerald-400">Now Enrolling for Spring 2026</span>
          </div>
        </div>
      </div>

      {/* Bottom fade gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-brand-bg to-transparent z-10" />

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
        <div className="flex flex-col items-center gap-2 text-white/50">
          <span className="text-xs uppercase tracking-widest">Scroll</span>
          <div className="h-8 w-[2px] bg-gradient-to-b from-white/50 to-transparent animate-pulse" />
        </div>
      </div>
    </section>
  );
}

/**
 * Floating Stat Card Component
 */
function StatCard({
  number,
  label,
  delay = 0
}: {
  number: string;
  label: string;
  delay?: number;
}) {
  return (
    <div
      className="group relative rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl transition-all hover:border-brand-accent/30 hover:bg-white/10"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Glow on hover */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-brand-accent/0 to-brand-accent/0 opacity-0 transition-opacity group-hover:opacity-20 blur-xl" />

      <div className="relative text-center">
        <p className="text-2xl font-bold text-white md:text-3xl">{number}</p>
        <p className="mt-1 text-xs text-brand-muted md:text-sm">{label}</p>
      </div>
    </div>
  );
}
