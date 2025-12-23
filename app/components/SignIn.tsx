export default function SignIn() {
  return (
    <div
      className="w-full max-w-sm border p-6"
      style={{
        backgroundColor: "var(--color-panel)",
        borderColor: "var(--color-border)",
        boxShadow: "var(--shadow-card)",
        borderRadius: "var(--radius-card)",
        color: "var(--color-text)",
      }}
    >
      <h1 className="text-xl font-semibold">Sign in</h1>
      <p className="mt-1 text-sm opacity-80">Welcome back to Interview Ready</p>

      <form className="mt-6 space-y-4">
        <div>
          <label className="text-sm font-medium">Email</label>
          <input
            className="mt-1 w-full rounded-md border px-3 py-2 focus:outline-none"
            style={{
              backgroundColor: "var(--color-panel)",
              borderColor: "var(--color-border)",
              color: "var(--color-text)",
            }}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Password</label>
          <input
            type="password"
            className="mt-1 w-full rounded-md border px-3 py-2 focus:outline-none"
            style={{
              backgroundColor: "var(--color-panel)",
              borderColor: "var(--color-border)",
              color: "var(--color-text)",
            }}
          />
        </div>

        <button
          className="mt-2 w-full rounded-md py-2 font-medium"
          style={{
            backgroundColor: "var(--color-accent)",
            color: "#fff",
          }}
        >
          Sign in
        </button>
      </form>
    </div>
  );
}
