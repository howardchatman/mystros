/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      // MYSTROS BARBER ACADEMY - BRAND COLOR SYSTEM
      colors: {
        // Core brand colors (extracted from shield logo)
        brand: {
          bg: "#0a0e17",           // Near-black navy - page backgrounds
          elevated: "#111827",     // Slightly lighter - card backgrounds
          primary: "#1e3a5f",      // Deep navy - primary brand color
          accent: "#3b82f6",       // Mid-blue - interactive elements
          accent2: "#60a5fa",      // Light-blue - hover states
          ice: "#93c5fd",          // Ice blue - subtle accents
          text: "#f8fafc",         // Off-white - primary text
          muted: "#64748b",        // Slate - secondary text
          gold: "#d4af37",         // Gold - premium accents
        },

        // Semantic colors
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        success: {
          DEFAULT: "#10b981",
          foreground: "#ffffff",
        },
        warning: {
          DEFAULT: "#f59e0b",
          foreground: "#000000",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },

      // Typography
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Plus Jakarta Sans", "Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },

      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.875rem" }],
      },

      // Spacing for consistent layouts
      spacing: {
        "18": "4.5rem",
        "88": "22rem",
        "128": "32rem",
      },

      // Border radius
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        "4xl": "2rem",
      },

      // Box shadows with brand accent glow
      boxShadow: {
        "glow-sm": "0 0 10px rgba(59, 130, 246, 0.15)",
        "glow-md": "0 0 20px rgba(59, 130, 246, 0.2)",
        "glow-lg": "0 0 30px rgba(59, 130, 246, 0.25)",
        "glow-accent": "0 0 20px rgba(59, 130, 246, 0.4)",
        "inner-glow": "inset 0 0 20px rgba(59, 130, 246, 0.1)",
        "card": "0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -2px rgba(0, 0, 0, 0.2)",
        "card-hover": "0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -4px rgba(0, 0, 0, 0.3), 0 0 20px rgba(59, 130, 246, 0.15)",
      },

      // Background images for textures
      backgroundImage: {
        "noise": "url('/textures/noise.svg')",
        "blueprint": "url('/textures/blueprint.svg')",
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "hero-gradient": "linear-gradient(135deg, #0a0e17 0%, #1e3a5f 50%, #0a0e17 100%)",
        "card-gradient": "linear-gradient(145deg, rgba(30, 58, 95, 0.3) 0%, rgba(10, 14, 23, 0.8) 100%)",
        "accent-gradient": "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
        "gold-gradient": "linear-gradient(135deg, #d4af37 0%, #f5d77a 50%, #d4af37 100%)",
      },

      // Backdrop blur for glassmorphism
      backdropBlur: {
        xs: "2px",
      },

      // Animations
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "fade-out": {
          from: { opacity: "1" },
          to: { opacity: "0" },
        },
        "slide-in-from-top": {
          from: { transform: "translateY(-10px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        "slide-in-from-bottom": {
          from: { transform: "translateY(10px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        "slide-in-from-left": {
          from: { transform: "translateX(-10px)", opacity: "0" },
          to: { transform: "translateX(0)", opacity: "1" },
        },
        "slide-in-from-right": {
          from: { transform: "translateX(10px)", opacity: "0" },
          to: { transform: "translateX(0)", opacity: "1" },
        },
        "scale-in": {
          from: { transform: "scale(0.95)", opacity: "0" },
          to: { transform: "scale(1)", opacity: "1" },
        },
        "shimmer": {
          from: { backgroundPosition: "0 0" },
          to: { backgroundPosition: "-200% 0" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(59, 130, 246, 0.2)" },
          "50%": { boxShadow: "0 0 30px rgba(59, 130, 246, 0.4)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "fade-out": "fade-out 0.3s ease-out",
        "slide-in-from-top": "slide-in-from-top 0.3s ease-out",
        "slide-in-from-bottom": "slide-in-from-bottom 0.3s ease-out",
        "slide-in-from-left": "slide-in-from-left 0.3s ease-out",
        "slide-in-from-right": "slide-in-from-right 0.3s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
        "shimmer": "shimmer 2s linear infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
      },

      // Typography plugin defaults
      typography: {
        DEFAULT: {
          css: {
            "--tw-prose-body": "#f8fafc",
            "--tw-prose-headings": "#f8fafc",
            "--tw-prose-links": "#3b82f6",
            "--tw-prose-bold": "#f8fafc",
            "--tw-prose-counters": "#64748b",
            "--tw-prose-bullets": "#64748b",
            "--tw-prose-hr": "#1e3a5f",
            "--tw-prose-quotes": "#93c5fd",
            "--tw-prose-quote-borders": "#3b82f6",
            "--tw-prose-captions": "#64748b",
            "--tw-prose-code": "#f8fafc",
            "--tw-prose-pre-code": "#f8fafc",
            "--tw-prose-pre-bg": "#111827",
            "--tw-prose-th-borders": "#1e3a5f",
            "--tw-prose-td-borders": "#1e3a5f",
          },
        },
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/typography"),
  ],
};
