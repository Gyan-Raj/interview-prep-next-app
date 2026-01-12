"use client";

import ThemeToggle from "@/app/components/ThemeToggle";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { clearUser, setUser } from "@/app/store/slices/authSlice";
import { toSentenceCase, roleDashboardRoute } from "@/app/utils/utils";
import { useState, useRef, useEffect } from "react";
import { RoleOps } from "@/app/types";
import { logout, me, switchRole } from "@/app/actions";

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
  const handleNavigate = () => {
    const role = user?.activeRole?.name?.toLowerCase();
    if (role) router.push(`/${role}/dashboard`);
  };

  async function handleSwitchRole(roleId: string) {
    try {
      const res = await switchRole({ roleId });

      if (res.status !== 200) return;

      // 🔑 Single source of truth
      const meRes = await me();
      if (meRes.status !== 200) return;

      const user = meRes.data;
      dispatch(setUser(user));

      const roleName = user.activeRole.name as RoleOps;
      router.replace(roleDashboardRoute[roleName]);
    } catch (error) {
      console.error("Error switching role", error);
    }
  }

  return (
    <header
      className="h-14 w-full border-b"
      style={{
        borderBottom: "0.5px solid var(--color-text)",
      }}
    >
      <div className="mx-auto flex h-full items-center justify-between px-1">
        <div
          onClick={handleNavigate}
          className="flex items-center gap-2 cursor-pointer px-4 py-1.5 rounded-xl transition-all duration-150 active:translate-y-px"
          style={{
            border: "0.5px solid var(--color-text)",
            boxShadow: "0 6px 14px rgba(0,0,0,0.12)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = "0 10px 22px rgba(0,0,0,0.18)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = "0 6px 14px rgba(0,0,0,0.12)";
          }}
        >
          <img src="/logo.png" alt="Interview Ready" className="h-6 w-6" />
          <span className="text-sm font-semibold select-none">
            Interview Ready
          </span>
        </div>

        <div className="flex items-center gap-3">
          {user && (
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
                {user.name} ({toSentenceCase(user.activeRole?.name ?? "")})
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
                    const isActive = role.name === user.activeRole?.name;
                    return (
                      <div
                        className={`${
                          isActive
                            ? "bg-(--color-border)"
                            : "hover:bg-(--color-hover)"
                        }`}
                        key={role.id}
                      >
                        <button
                          key={role.id}
                          disabled={isActive}
                          onClick={() => {
                            handleSwitchRole(role.id);
                            setRoleModalOpen(false);
                          }}
                          className={`block w-full px-3 py-2 text-left text-sm transition-colors disabled:opacity-60`}
                        >
                          {toSentenceCase(role.name)}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* <ThemeToggle /> */}
          <div
            className="h-7 w-7 p-1 rounded-full border border-(--color-border) transition-colors bg-(--color-panel) hover:bg-(--color-hover)"
            style={{ color: "var(--color-text)" }}
          >
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
