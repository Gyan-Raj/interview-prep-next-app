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
    <header
      className="h-14 w-full border-b"
      style={{ borderColor: "var(--color-border)" }}
    >
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4">
        {/* App name */}
        <div className="text-lg font-semibold">Interview Ready</div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          {user && (
            <div className="flex items-center gap-2">
              <span className="text-sm" style={{ color: "var(--color-text)" }}>
                {user.name}
              </span>

              <div
                className="h-8 w-8 overflow-hidden rounded-full"
                style={{ backgroundColor: "var(--color-border)" }}
              >
                {user.avatarUrl && (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
