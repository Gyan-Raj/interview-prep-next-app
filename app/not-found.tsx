"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAppDispatch } from "./store/hooks";
import { setUser } from "./store/slices/authSlice";
import { roleDashboardRoute } from "@/app/utils/utils";
import { AuthUser } from "./types";
import { me } from "./actions";

export default function NotFound() {
  const router = useRouter();
  const [dashboard, setDashboard] = useState("/");
  const dispatch = useAppDispatch();

  const fetchMe = async () => {
    try {
      const res = await me();
      if (res.status === 200) {
        const data: AuthUser = res.data;

        if (data?.activeRole) {
          dispatch(setUser(data));
          const targetRoute = roleDashboardRoute[data.activeRole.name];
          setDashboard(targetRoute);
          router.replace(targetRoute);
        }
      }
    } catch (error) {
      console.error("Error fetching user details in (api/me)", error);
    }
  };

  useEffect(() => {
    fetchMe();
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
