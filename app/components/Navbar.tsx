"use client";

import ThemeToggle from "@/app/components/ThemeToggle";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { clearUser, setUser } from "@/app/store/slices/authSlice";
import { toSentenceCase, roleDashboardRoute } from "@/app/utils/utils";
import { useState, useRef, useEffect } from "react";
import { AuthUser } from "@/app/types";
import { logout, switchRole } from "@/app/actions";

type SwitchRoleResponse = {
  data: AuthUser;
};

export default function Navbar() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [roleModalOpen, setRoleModalOpen] = useState(false);

  const roleRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (roleRef.current && !roleRef.current.contains(e.target as Node)) {
        setRoleModalOpen(false);
      }
    }

    if (roleModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [roleModalOpen]);

  async function handleSwitchRole(roleId: string) {
    try {
      const res = await switchRole({ roleId });
      if (res.status === 200) {
        const { data }: SwitchRoleResponse = res;
        dispatch(setUser(data));
        const targetRoute = roleDashboardRoute[data.activeRole.name];
        router.replace(targetRoute);
      }
    } catch (error) {
      console.error("Error switching the role (api/switch-role", error);
    }
  }

  async function handleLogout() {
    try {
      const res = await logout();
      if (res.status === 200) {
        dispatch(clearUser());
        router.replace("/");
        router.refresh();
      }
    } catch (error) {
      console.error("Error logging out (api/logout)", error);
    }
  }

  return (
    <header
      className="h-14 w-full border-b"
      style={{ borderColor: "var(--color-border)" }}
    >
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4">
        <div className="text-lg font-semibold">Interview Ready</div>

        <div className="flex items-center gap-3">
          {user && (
            <>
              <div className="relative" ref={roleRef}>
                <button
                  onClick={() => {
                    if (user.roles.length > 1) {
                      setRoleModalOpen((v) => !v);
                    }
                  }}
                  className={`text-sm opacity-80 ${
                    user.roles.length > 1 ? "cursor-pointer" : "cursor-default"
                  }`}
                >
                  {user.name} ({toSentenceCase(user.activeRole.name)})
                </button>

                {roleModalOpen && (
                  <div
                    className="absolute right-0 mt-2 w-44 rounded border shadow-md z-50"
                    style={{
                      backgroundColor: "var(--color-panel)",
                      borderColor: "var(--color-border)",
                    }}
                  >
                    {user.roles.map((role) => {
                      const isActive = role.name === user.activeRole.name;
                      return (
                        <button
                          key={role.id}
                          disabled={isActive}
                          onClick={() => {
                            handleSwitchRole(role.id);
                            setRoleModalOpen(false);
                          }}
                          className="block w-full px-3 py-2 text-left text-sm transition-colors hover:bg-(--color-border) disabled:opacity-60"
                        >
                          {toSentenceCase(role.name)}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <button
                onClick={handleLogout}
                className="rounded border px-3 py-1 text-sm cursor-pointer hover:bg-(--color-border)"
              >
                Logout
              </button>
            </>
          )}

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
