import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "sonner";
import { AuthProvider } from "@/components/providers/auth-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import "./globals.css";

// Load Inter as the primary font
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

// Load Plus Jakarta Sans as the display font
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-plus-jakarta",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env["NEXT_PUBLIC_SITE_URL"] ?? "http://localhost:3000"),
  title: {
    default: "Mystros Barber Academy | Houston's Premier Barber School",
    template: "%s | Mystros Barber Academy",
  },
  description:
    "Transform your passion into a career at Mystros Barber Academy. COE accredited barber school in Houston offering Class A Barber and Cosmetology Crossover programs. Financial aid available. FAFSA Code: 042609.",
  keywords: [
    "barber school Houston",
    "barber academy Texas",
    "Class A Barber license",
    "cosmetology to barber crossover",
    "barbering program",
    "hair cutting school",
    "barber training",
    "financial aid barber school",
    "TDLR barber school",
    "COE accredited",
  ],
  authors: [{ name: "Mystros Barber Academy" }],
  creator: "Mystros Barber Academy",
  publisher: "Mystros Barber Academy",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Mystros Barber Academy",
    title: "Mystros Barber Academy | Houston's Premier Barber School",
    description:
      "Transform your passion into a career at Mystros Barber Academy. COE accredited, financial aid available.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Mystros Barber Academy",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mystros Barber Academy | Houston's Premier Barber School",
    description:
      "Transform your passion into a career at Mystros Barber Academy. COE accredited, financial aid available.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#0a0e17",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${plusJakarta.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://static.wixstatic.com" />
        <link rel="preconnect" href="https://www.youtube-nocookie.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider>
          {/* Skip to main content for accessibility */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:outline-none"
          >
            Skip to main content
          </a>

          <AuthProvider>
            {children}
          </AuthProvider>

          <Toaster
            position="top-right"
            toastOptions={{
              classNames: {
                toast: "bg-card border-border text-card-foreground",
                title: "text-foreground",
                description: "text-muted-foreground",
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
