"use client";

import ThemeToggle from "@/app/components/ThemeToggle";

type User = {
  name: string;
  avatarUrl?: string;
};

type NavbarProps = {
  user?: User | null;
};

export default function Navbar({ user }: NavbarProps) {
  return (
    <header className="h-14 w-full border-b border-neutral-200 dark:border-neutral-800">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4">
        {/* Left: App name */}
        <div className="text-lg font-semibold tracking-tight">
          Interview Ready
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {/* Theme toggle */}
          <ThemeToggle />

          {/* Authenticated user area (future-proof) */}
          {user && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-600 dark:text-neutral-300">
                {user.name}
              </span>

              <div className="h-8 w-8 overflow-hidden rounded-full bg-neutral-300 dark:bg-neutral-700">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
