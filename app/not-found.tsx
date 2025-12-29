"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAppDispatch } from "./store/hooks";
import { setUser } from "./store/slices/authSlice";
import { roleDashboardRoute } from "./utils/utils";
import { AuthUser } from "./types";

export default function NotFound() {
  const router = useRouter();
  const [dashboard, setDashboard] = useState("/");
  const dispatch = useAppDispatch();

  useEffect(() => {
    fetch("/api/me")
      .then((res) => {
        return res.json();
      })
      .then((data: AuthUser) => {
        if (data?.activeRole) {
          dispatch(setUser(data));
          const targetRoute = roleDashboardRoute[data.activeRole.name];
          setDashboard(targetRoute);
        }
      });
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-3xl font-semibold">Page not found</h1>
      <p className="opacity-70">
        The page you are trying to access does not exist.
      </p>

      <div className="flex gap-3 mt-4">
        <button
          onClick={() => router.push(dashboard)}
          className="px-4 py-2 rounded bg-blue-600 text-white"
        >
          Go Home
        </button>

        <button
          onClick={() => router.back()}
          className="px-4 py-2 rounded border"
        >
          Go Back
        </button>
      </div>
    </div>
  );
}
