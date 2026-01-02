"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { changePassword } from "../actions";

export default function ChangePasswordClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!token) {
      router.replace("/");
      return;
    }

    setLoading(true);

    try {
      const res = await changePassword({ token, password });

      if (res.status !== 200) {
        const data = await res.data;
        setError(data.message || "Failed to set password");
        return;
      }

      // Successful password set → backend already created session
      router.replace("/");
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center h-screen">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <h1 className="text-lg font-semibold">Set your password</h1>

        <input
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border rounded"
        />

        {error && <div className="text-sm text-red-500">{error}</div>}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-2"
        >
          {loading ? "Setting password…" : "Set Password"}
        </button>
      </form>
    </div>
  );
}
