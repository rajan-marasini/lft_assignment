import { CalendarDays, LogOut, Plus, User as UserIcon } from "lucide-react";
import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import { useCurrentUser, useLogout } from "@/hooks/useAuth";

export const HomePage = () => {
  const { data: user, isLoading } = useCurrentUser();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans antialiased">
      {/* Top Navbar */}
      <header className="border-b border-zinc-800 bg-zinc-900/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-100 shadow-sm">
              <CalendarDays className="h-5 w-5" />
            </div>
            <span className="font-bold text-lg text-zinc-100">EventPulse</span>
          </div>

          <div className="flex items-center gap-4">
            {isLoading ? (
              <div className="h-8 w-24 bg-zinc-800 rounded animate-pulse" />
            ) : user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-200">
                  <UserIcon className="h-3.5 w-3.5 text-zinc-400" />
                  <span className="font-medium">{user.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => logout()}
                  disabled={isLoggingOut}
                  className="text-zinc-400 hover:text-white hover:bg-zinc-900"
                >
                  <LogOut className="h-4 w-4 mr-1.5" />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="text-zinc-300 hover:text-white">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-zinc-100">
              Events Dashboard
            </h1>
            <p className="text-sm text-zinc-400 mt-1">
              Browse upcoming public events or sign in to manage your private schedules.
            </p>
          </div>

          {user && (
            <Button className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200 font-medium">
              <Plus className="h-4 w-4 mr-2" /> Create Event
            </Button>
          )}
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-8 text-center max-w-lg mx-auto my-12">
          <CalendarDays className="h-12 w-12 text-zinc-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-zinc-100 mb-2">Welcome to EventPulse</h3>
          <p className="text-sm text-zinc-400 mb-6">
            Authentication setup is complete! You can now sign up, log in with JWT and refresh tokens, and manage event schedules.
          </p>
          {!user && (
            <div className="flex justify-center gap-3">
              <Link to="/login">
                <Button className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200">
                  Go to Login Page
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="outline" className="border-zinc-800 text-zinc-200 hover:bg-zinc-900">
                  Register Account
                </Button>
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default HomePage;
