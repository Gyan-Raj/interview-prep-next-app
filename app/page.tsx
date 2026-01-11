"use client";
import SignIn from "@/app/components/SignIn";
import { useAuthBootstrap } from "@/app/hooks/hooks";

export default function Home() {
  useAuthBootstrap();

  return (
    <main className="h-[calc(100vh-3.5rem)] flex items-center justify-center">
      <SignIn />
    </main>
  );
}
