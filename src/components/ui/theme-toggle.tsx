"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({ className, showLabel = false }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={cn("h-10 w-10 rounded-lg bg-muted animate-pulse", className)} />
    );
  }

  const cycleTheme = () => {
    if (theme === "dark") {
      setTheme("light");
    } else if (theme === "light") {
      setTheme("system");
    } else {
      setTheme("dark");
    }
  };

  const getIcon = () => {
    switch (theme) {
      case "dark":
        return <Moon className="h-5 w-5" />;
      case "light":
        return <Sun className="h-5 w-5" />;
      default:
        return <Monitor className="h-5 w-5" />;
    }
  };

  const getLabel = () => {
    switch (theme) {
      case "dark":
        return "Dark";
      case "light":
        return "Light";
      default:
        return "System";
    }
  };

  return (
    <button
      onClick={cycleTheme}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg p-2.5",
        "bg-primary/10 hover:bg-primary/20 border border-primary/20",
        "text-foreground hover:text-primary",
        "transition-colors duration-200",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background",
        className
      )}
      aria-label={`Current theme: ${getLabel()}. Click to change.`}
    >
      {getIcon()}
      {showLabel && <span className="text-sm font-medium">{getLabel()}</span>}
    </button>
  );
}

// Dropdown version for more control
export function ThemeToggleDropdown({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={cn("h-10 w-10 rounded-lg bg-muted animate-pulse", className)} />
    );
  }

  const themes = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ] as const;

  const defaultTheme = { value: "system" as const, label: "System", icon: Monitor };
  const currentTheme = themes.find((t) => t.value === theme) ?? defaultTheme;
  const CurrentIcon = currentTheme.icon;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-lg p-2.5",
          "bg-muted/50 hover:bg-muted",
          "text-muted-foreground hover:text-foreground",
          "transition-colors duration-200",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background",
          className
        )}
        aria-label="Select theme"
        aria-expanded={isOpen}
      >
        <CurrentIcon className="h-5 w-5" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-36 rounded-lg border border-border bg-popover p-1 shadow-lg z-50">
            {themes.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => {
                  setTheme(value);
                  setIsOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm",
                  "transition-colors duration-150",
                  theme === value
                    ? "bg-accent text-accent-foreground"
                    : "text-popover-foreground hover:bg-muted"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
