"use client";

import { cn } from "@/lib/utils/cn";

interface TextureBackgroundProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "hero" | "section" | "card";
  withNoise?: boolean;
  withBlueprint?: boolean;
  withGradientSpot?: boolean;
  gradientSpotPosition?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center";
}

/**
 * TextureBackground Component
 *
 * Wraps content with the Mystros brand texture system:
 * - Noise overlay for premium texture feel
 * - Blueprint grid for technical aesthetic
 * - Gradient spots for depth and visual interest
 */
export function TextureBackground({
  children,
  className,
  variant = "default",
  withNoise = true,
  withBlueprint = false,
  withGradientSpot = false,
  gradientSpotPosition = "top-right",
}: TextureBackgroundProps) {
  const gradientSpotPositions = {
    "top-left": "-top-32 -left-32",
    "top-right": "-top-32 -right-32",
    "bottom-left": "-bottom-32 -left-32",
    "bottom-right": "-bottom-32 -right-32",
    "center": "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
  };

  const variantStyles = {
    default: "bg-brand-bg",
    hero: "bg-gradient-to-br from-brand-bg via-brand-primary/20 to-brand-bg",
    section: "bg-brand-elevated/30",
    card: "bg-brand-elevated/50 backdrop-blur-xl",
  };

  return (
    <div className={cn("relative overflow-hidden", variantStyles[variant], className)}>
      {/* Noise Overlay */}
      {withNoise && (
        <div
          className="pointer-events-none absolute inset-0 z-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat",
          }}
          aria-hidden="true"
        />
      )}

      {/* Blueprint Grid Overlay */}
      {withBlueprint && (
        <div
          className="pointer-events-none absolute inset-0 z-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(59, 130, 246, 0.3) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(59, 130, 246, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
          aria-hidden="true"
        />
      )}

      {/* Gradient Spot */}
      {withGradientSpot && (
        <div
          className={cn(
            "pointer-events-none absolute z-0 h-96 w-96 rounded-full bg-brand-accent/10 blur-3xl",
            gradientSpotPositions[gradientSpotPosition]
          )}
          aria-hidden="true"
        />
      )}

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

/**
 * GlassCard Component
 *
 * A glassmorphic card with optional glow effect
 */
interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  withGlow?: boolean;
  withHover?: boolean;
  as?: "div" | "article" | "section";
}

export function GlassCard({
  children,
  className,
  withGlow = false,
  withHover = true,
  as: Component = "div",
}: GlassCardProps) {
  return (
    <Component
      className={cn(
        "relative overflow-hidden rounded-xl",
        "bg-brand-elevated/50 backdrop-blur-xl",
        "border border-white/5",
        "shadow-card",
        withHover && "transition-all duration-300 hover:border-brand-accent/20 hover:shadow-card-hover",
        withGlow && "shadow-glow-sm hover:shadow-glow-md",
        className
      )}
    >
      {children}
    </Component>
  );
}

/**
 * GradientText Component
 *
 * Text with gradient fill
 */
interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
  variant?: "accent" | "gold";
}

export function GradientText({
  children,
  className,
  variant = "accent",
}: GradientTextProps) {
  const gradientStyles = {
    accent: "from-brand-accent to-brand-accent2",
    gold: "from-brand-gold via-amber-300 to-brand-gold",
  };

  return (
    <span
      className={cn(
        "bg-gradient-to-r bg-clip-text text-transparent",
        gradientStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
