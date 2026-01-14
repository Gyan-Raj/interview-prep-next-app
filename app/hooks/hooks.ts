"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/app/store/hooks";
import { setUser } from "@/app/store/slices/authSlice";
import { me } from "@/app/actions";
import { roleDashboardRoute } from "@/app/utils/utils";
import api from "@/app/api";
import { RoleOps } from "@/app/types";

export function useDebounce<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}

export function useOutsideClick(
  ref: React.RefObject<HTMLElement | null>,
  enabled: boolean,
  onClose: () => void
) {
  useEffect(() => {
    if (!enabled) return;

    function handler(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) {
        onClose();
      }
    }

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [ref, enabled, onClose]);
}

export function useAuthBootstrap() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  useEffect(() => {
    const bootstrap = async () => {
      try {
        let res = await me();

        const roleName = res.data.activeRole.name as RoleOps;
        dispatch(setUser(res.data));
        router.replace(roleDashboardRoute[roleName]);
      } catch (err) {
        // silently fail → user remains logged out
        console.error("Auth bootstrap failed", err);
      }
    };

    bootstrap();
  }, [dispatch, router]);
}
