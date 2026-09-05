import type { ReactNode } from "react";
import { CalendarDays, CheckCircle2, Users, ShieldCheck, Tag } from "lucide-react";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

export const AuthLayout = ({ children, title, subtitle }: AuthLayoutProps) => {
  return (
    <div className="w-screen h-screen max-h-screen overflow-hidden flex flex-col md:flex-row bg-background antialiased select-none">
      {/* Left Branding Showcase Side (Clean Solid Dark) */}
      <div className="hidden md:flex md:w-1/2 lg:w-7/12 bg-zinc-950 text-zinc-100 p-8 lg:p-14 flex-col justify-between relative overflow-hidden border-r border-zinc-800">
        
        {/* Subtle SVG Grid lines background */}
        <div 
          className="absolute inset-0 opacity-[0.05] pointer-events-none" 
          style={{ 
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '24px 24px' 
          }} 
        />

        {/* Top Header Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-100 shadow-sm">
            <CalendarDays className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-lg tracking-tight text-zinc-100">
              EventPulse
            </span>
            <span className="text-xs text-zinc-400 font-normal">Event Management Platform</span>
          </div>
        </div>

        {/* Middle Hero Content */}
        <div className="relative z-10 my-auto py-8 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-medium mb-6">
            Platform Overview
          </div>

          <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight text-zinc-100 leading-[1.15] mb-4">
            Manage your events with complete control.
          </h1>

          <p className="text-zinc-400 text-sm lg:text-base leading-relaxed mb-8">
            Create public or private events, categorize with custom tags, track attendees, and manage schedules securely.
          </p>

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-zinc-900/50 border border-zinc-800/80">
              <Tag className="h-5 w-5 text-zinc-300 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-semibold text-zinc-100">Custom Tagging</h4>
                <p className="text-xs text-zinc-400 mt-0.5">Filter events by categories and tags</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-lg bg-zinc-900/50 border border-zinc-800/80">
              <ShieldCheck className="h-5 w-5 text-zinc-300 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-semibold text-zinc-100">Secure Access</h4>
                <p className="text-xs text-zinc-400 mt-0.5">JWT authentication & role authorization</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-lg bg-zinc-900/50 border border-zinc-800/80">
              <Users className="h-5 w-5 text-zinc-300 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-semibold text-zinc-100">Privacy Control</h4>
                <p className="text-xs text-zinc-400 mt-0.5">Easily switch public and private visibility</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-lg bg-zinc-900/50 border border-zinc-800/80">
              <CheckCircle2 className="h-5 w-5 text-zinc-300 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-semibold text-zinc-100">Timeline Filtering</h4>
                <p className="text-xs text-zinc-400 mt-0.5">Separate upcoming and past schedules</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 pt-4 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
          <span>&copy; {new Date().getFullYear()} EventPulse</span>
          <span className="font-normal text-zinc-400">
            Node.js & Express + React
          </span>
        </div>
      </div>

      {/* Right Form Container Side */}
      <div className="w-full md:w-1/2 lg:w-5/12 h-full max-h-screen overflow-y-auto flex flex-col justify-between p-6 sm:p-10 lg:p-14 bg-background">
        {/* Mobile Header Logo */}
        <div className="flex md:hidden items-center gap-2 mb-6">
          <div className="h-9 w-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-100">
            <CalendarDays className="h-5 w-5" />
          </div>
          <span className="font-semibold text-lg tracking-tight text-foreground">EventPulse</span>
        </div>

        {/* Form Box Wrapper */}
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
