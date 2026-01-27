"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X, Phone, ChevronDown, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const navLinks = [
  { label: "Programs", href: "/programs", hasDropdown: true },
  { label: "Admissions", href: "/admissions" },
  { label: "Financial Aid", href: "/financial-aid" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const programLinks = [
  {
    label: "Class A Barber",
    href: "/programs/class-a-barber",
    description: "1000 hours • Full barbering license",
  },
  {
    label: "Crossover Program",
    href: "/programs/crossover",
    description: "300 hours • For licensed cosmetologists",
  },
];

/**
 * Modern Sticky Header with Glassmorphism
 *
 * Features:
 * - Transparent on top, glass blur when scrolled
 * - Animated logo
 * - Dropdown menus with smooth animations
 * - Mobile responsive with slide-in menu
 */
export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Handle scroll state
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          isScrolled
            ? "bg-background/80 backdrop-blur-xl border-b border-border shadow-lg"
            : "bg-transparent"
        )}
      >
        <div className="container-wide">
          <nav className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link
              href="/"
              className="relative flex items-center gap-3 group"
            >
              <div className="relative h-10 w-10 md:h-12 md:w-12 transition-transform group-hover:scale-105 rounded-lg overflow-hidden">
                <Image
                  src="https://static.wixstatic.com/media/4b26b4_de32d7f54cab4f258ce06c39faef6777~mv2.png/v1/fill/w_301,h_301,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/My%20project%20%2813%29.png"
                  alt="Mystros Barber Academy"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <div className="hidden sm:block">
                <span className="font-display font-bold text-foreground text-sm md:text-base">
                  Mystros
                </span>
                <span className="block text-[10px] md:text-xs text-muted-foreground -mt-0.5">
                  Barber Academy
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <div
                  key={link.label}
                  className="relative"
                  onMouseEnter={() => link.hasDropdown && setActiveDropdown(link.label)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <Link
                    href={link.href}
                    className={cn(
                      "flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                      "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    {link.label}
                    {link.hasDropdown && (
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 transition-transform",
                          activeDropdown === link.label && "rotate-180"
                        )}
                      />
                    )}
                  </Link>

                  {/* Dropdown Menu */}
                  {link.hasDropdown && activeDropdown === link.label && (
                    <div className="absolute top-full left-0 pt-2 w-72">
                      <div className="rounded-xl border border-border bg-popover/95 backdrop-blur-xl p-2 shadow-xl animate-fade-in">
                        {programLinks.map((program) => (
                          <Link
                            key={program.href}
                            href={program.href}
                            className="flex flex-col gap-0.5 rounded-lg px-4 py-3 transition-all hover:bg-muted/50"
                          >
                            <span className="font-medium text-foreground">
                              {program.label}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {program.description}
                            </span>
                          </Link>
                        ))}
                        <div className="mt-2 pt-2 border-t border-border">
                          <Link
                            href="/programs"
                            className="flex items-center gap-2 px-4 py-2 text-sm text-primary hover:underline"
                          >
                            View all programs
                            <ArrowRight className="h-3 w-3" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Desktop CTA */}
            <div className="hidden lg:flex items-center gap-3">
              <ThemeToggle />
              <a
                href="tel:8322864248"
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <Phone className="h-4 w-4" />
                <span className="hidden xl:inline">(832) 286-4248</span>
              </a>
              <Link
                href="/student-portal"
                className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
              >
                Student Login
              </Link>
              <Link
                href="/apply"
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all hover:shadow-lg"
              >
                Apply Now
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden flex items-center justify-center h-10 w-10 rounded-lg bg-muted/50 text-foreground hover:bg-muted transition-colors"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </nav>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-background/95 backdrop-blur-xl lg:hidden transition-all duration-300",
          isMobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        )}
      >
        <div
          className={cn(
            "flex flex-col h-full pt-20 pb-6 px-6 transition-all duration-500 delay-100",
            isMobileMenuOpen
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-4"
          )}
        >
          {/* Mobile Nav Links */}
          <nav className="flex-1 space-y-1">
            {navLinks.map((link, index) => (
              <div key={link.label}>
                <Link
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between px-4 py-4 rounded-xl text-lg font-medium text-foreground hover:bg-muted/50 transition-colors"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {link.label}
                  {link.hasDropdown && (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </Link>
                {link.hasDropdown && (
                  <div className="ml-4 space-y-1">
                    {programLinks.map((program) => (
                      <Link
                        key={program.href}
                        href={program.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex flex-col px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                      >
                        <span className="text-sm font-medium">{program.label}</span>
                        <span className="text-xs">{program.description}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Mobile CTA Buttons */}
          <div className="space-y-3 pt-6 border-t border-border">
            {/* Theme Toggle for Mobile */}
            <div className="flex items-center justify-between px-4 py-3 rounded-xl border border-border">
              <span className="text-foreground font-medium">Theme</span>
              <ThemeToggle showLabel />
            </div>
            <a
              href="tel:8322864248"
              className="flex items-center justify-center gap-2 w-full py-4 rounded-xl border border-border text-foreground font-medium hover:bg-muted/50 transition-colors"
            >
              <Phone className="h-5 w-5" />
              (832) 286-4248
            </a>
            <Link
              href="/student-portal"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-center w-full py-4 rounded-xl border border-border text-foreground font-medium hover:bg-muted/50 transition-colors"
            >
              Student Login
            </Link>
            <Link
              href="/apply"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
            >
              Apply Now
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
