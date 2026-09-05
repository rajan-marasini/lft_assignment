import { CalendarDays, LogOut, Plus } from "lucide-react";
import { Link } from "react-router";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCurrentUser, useLogout } from "@/hooks/useAuth";

export const Header = () => {
  const { data: user, isLoading } = useCurrentUser();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();

  /** Generate up to 2 initials from the user's name */
  const initials = user?.name
    ? user.name
        .split(" ")
        .slice(0, 2)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "";

  return (
    <header className="bg-white border-b border-stone-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <CalendarDays className="h-5 w-5 text-amber-600" />
          <span className="font-bold text-stone-900 text-base tracking-tight">
            EventPulse
          </span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {isLoading ? (
            <div className="h-8 w-8 bg-stone-100 rounded-full animate-pulse" />
          ) : user ? (
            <DropdownMenu>
              {/* Trigger: avatar circle + name */}
              <DropdownMenuTrigger
                id="user-avatar-trigger"
                aria-label="Open user menu"
                className="flex items-center gap-2 cursor-pointer select-none rounded focus-visible:outline-2 focus-visible:outline-stone-400"
              >
                <div className="h-8 w-8 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0">
                  <span className="text-xs font-semibold text-amber-700">
                    {initials}
                  </span>
                </div>
                <span className="hidden sm:block text-sm font-medium text-stone-700 max-w-30 truncate">
                  {user.name}
                </span>
              </DropdownMenuTrigger>

              {/* Dropdown panel */}
              <DropdownMenuContent
                align="end"
                sideOffset={8}
                className="w-56! min-w-56"
              >
                {/* User identity — label MUST be inside a Group */}
                <DropdownMenuGroup>
                  <DropdownMenuLabel>
                    <p className="text-sm font-semibold text-stone-800 truncate">
                      {user.name}
                    </p>
                    <p className="text-xs font-normal text-stone-400 truncate mt-0.5">
                      {user.email}
                    </p>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                <DropdownMenuGroup>
                  <DropdownMenuItem
                    id="dropdown-create-event"
                    className="cursor-pointer gap-2.5"
                  >
                    <Plus className="h-4 w-4 text-stone-500 shrink-0" />
                    Create Event
                  </DropdownMenuItem>
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                <DropdownMenuGroup>
                  <DropdownMenuItem
                    id="dropdown-logout"
                    variant="destructive"
                    className="cursor-pointer gap-2.5"
                    disabled={isLoggingOut}
                    onClick={() => logout()}
                  >
                    <LogOut className="h-4 w-4 shrink-0" />
                    {isLoggingOut ? "Signing out…" : "Sign out"}
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                id="signin-btn"
                className="text-sm text-stone-600 hover:text-stone-900 transition-colors px-3 py-1.5 rounded hover:bg-stone-100"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                id="getstarted-btn"
                className="text-sm bg-stone-900 text-white hover:bg-stone-700 transition-colors px-4 py-1.5 rounded font-medium"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
