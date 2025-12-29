"use client";

import { login } from "@/app/actions";
import { useFormik } from "formik";
import { useRouter } from "next/navigation";
import * as yup from "yup";
import { roleDashboardRoute } from "../utils/utils";
import { Role } from "../types";

const initialValues = {
  email: "",
  password: "",
};

const validationSchema = yup.object({
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup.string().required("Password is required"),
});

export default function SignIn() {
  const router = useRouter();
  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const res = await login(values);

        if (res?.status === 200) {
          const activeRole: Role = res.data.data.activeRole;

          const dashboard = roleDashboardRoute[activeRole.name];
          router.replace(dashboard);
        }
      } catch (error) {
        console.error("Error logging in (SignIn):", error);
      }
    },
  });

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

      {/* ✅ IMPORTANT: formik.handleSubmit */}
      <form className="mt-6 space-y-4" onSubmit={formik.handleSubmit}>
        <div>
          <label className="text-sm font-medium">Email</label>
          <input
            type="email"
            name="email"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="mt-1 w-full rounded-md border px-3 py-2 focus:outline-none"
            style={{
              backgroundColor: "var(--color-panel)",
              borderColor: "var(--color-border)",
              color: "var(--color-text)",
            }}
          />
          {formik.touched.email && formik.errors.email && (
            <p className="text-sm text-red-500">{formik.errors.email}</p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium">Password</label>
          <input
            type="password"
            name="password"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="mt-1 w-full rounded-md border px-3 py-2 focus:outline-none"
            style={{
              backgroundColor: "var(--color-panel)",
              borderColor: "var(--color-border)",
              color: "var(--color-text)",
            }}
          />
          {formik.touched.password && formik.errors.password && (
            <p className="text-sm text-red-500">{formik.errors.password}</p>
          )}
        </div>

        <button
          type="submit"
          className="mt-2 w-full rounded-md py-2 font-medium"
          style={{
            backgroundColor: "var(--color-accent)",
            color: "#fff",
          }}
          disabled={formik.isSubmitting}
        >
          {formik.isSubmitting ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}
