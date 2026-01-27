import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-brand-bg via-brand-primary/20 to-brand-bg">
      {/* Brand logo */}
      <div className="absolute top-6 left-6 z-10">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-brand-accent to-brand-accent2 flex items-center justify-center">
            <span className="text-xl font-bold text-white">M</span>
          </div>
          <span className="text-lg font-display font-semibold text-brand-text group-hover:text-brand-accent transition-colors">
            Mystros
          </span>
        </Link>
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-md">
        {children}
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 left-0 right-0 text-center text-sm text-brand-muted">
        <p>&copy; {new Date().getFullYear()} Mystros Barber Academy. All rights reserved.</p>
      </div>
    </div>
  );
}
