import { CalendarDays } from "lucide-react";
import type { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

export const AuthLayout = ({ children, title, subtitle }: AuthLayoutProps) => {
  return (
    <div className="w-screen h-screen max-h-screen overflow-hidden flex flex-col md:flex-row bg-background antialiased select-none">
      {/* Left Side Showcase (Minimalist Solid Dark) */}
      <div className="hidden md:flex md:w-1/2 lg:w-6/12 bg-zinc-950 text-zinc-100 p-8 lg:p-14 flex-col justify-between relative overflow-hidden border-r border-zinc-800">
        {/* Subtle background grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: "24px 24px",
          }}
        />

        {/* Top Header Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="h-9 w-9 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-100 shadow-sm">
            <CalendarDays className="h-5 w-5" />
          </div>
          <span className="font-semibold text-lg tracking-tight text-zinc-100">
            EventPulse
          </span>
        </div>

        {/* Middle Hero Content - Simple 1-2 liner */}
        <div className="relative z-10 my-auto max-w-lg space-y-4">
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-zinc-100 leading-tight">
            Plan, organize, and discover events effortlessly.
          </h1>
          <p className="text-zinc-400 text-base leading-relaxed">
            Streamline your event experience with seamless management and instant category filtering.
          </p>
        </div>

        {/* Footer */}
        <div className="relative z-10 pt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500">
          <span>&copy; {new Date().getFullYear()} EventPulse</span>
        </div>
      </div>

      {/* Right Form Side */}
      <div className="w-full md:w-1/2 lg:w-6/12 h-full max-h-screen overflow-y-auto flex flex-col justify-between p-6 sm:p-10 lg:p-14 bg-background">
        {/* Mobile Header Logo */}
        <div className="flex md:hidden items-center gap-2 mb-6">
          <div className="h-9 w-9 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-100">
            <CalendarDays className="h-5 w-5" />
          </div>
          <span className="font-semibold text-lg tracking-tight text-foreground">
            EventPulse
          </span>
        </div>

        {/* Form Container */}
        <div className="my-auto w-full max-w-sm mx-auto">
          <div className="mb-6 space-y-1">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              {title}
            </h2>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>

          {children}
        </div>

        {/* Bottom Disclaimer */}
        <div className="mt-8 text-center text-xs text-muted-foreground">
          By continuing, you agree to our Terms of Service & Privacy Policy.
        </div>
      </div>
    </div>
  );
};
