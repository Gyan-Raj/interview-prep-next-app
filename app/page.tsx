"use client";
import SignIn from "@/app/components/SignIn";
import { me } from "./actions";
import { AuthUser } from "./types";
import { useAppDispatch } from "./store/hooks";
import { setUser } from "./store/slices/authSlice";
import { roleDashboardRoute } from "./utils/utils";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const fetchMe = async () => {
    try {
      const res = await me();
      if (res.status === 200) {
        const data: AuthUser = res.data;

        if (data?.activeRole) {
          dispatch(setUser(data));
          const targetRoute = roleDashboardRoute[data.activeRole?.name];
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
    <main className="h-[calc(100vh-3.5rem)] overflow-hidden flex items-center justify-center">
      <SignIn />
    </main>
  );
}
