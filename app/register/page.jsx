"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { authStore } from "@/lib/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "student",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify(form),
      });
      authStore.saveAuth(res.data.token, res.data.user);
      router.push("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="container-page py-8">
      <div className="mx-auto max-w-md rounded-xl bg-white p-6 shadow-sm">
        <h1 className="mb-6 text-2xl font-bold">Create Account</h1>
        <form onSubmit={onSubmit} className="space-y-4">
          <input
            className="w-full rounded-md border p-2.5"
            placeholder="Full Name"
            value={form.fullName}
            onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
            required
          />
          <input
            className="w-full rounded-md border p-2.5"
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            required
          />
          <input
            className="w-full rounded-md border p-2.5"
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
            required
          />
          <select
            className="w-full rounded-md border p-2.5"
            value={form.role}
            onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
          >
            <option value="student">Student</option>
            <option value="instructor">Instructor</option>
          </select>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <button
            disabled={loading}
            className="w-full rounded-md bg-brand-600 px-4 py-2.5 font-medium text-white disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>
      </div>
    </section>
  );
}
