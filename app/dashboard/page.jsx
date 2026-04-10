"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { authStore } from "@/lib/auth";
import { apiRequest } from "@/lib/api";

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const currentUser = authStore.getUser();
    if (!currentUser) {
      window.location.href = "/login";
      return;
    }
    Promise.all([apiRequest("/auth/me"), apiRequest("/courses?published=true")])
      .then(([meRes, coursesRes]) => {
        authStore.saveUser(meRes.data);
        setUser(meRes.data);
        setCourses(coursesRes.data || []);
      })
      .catch((err) => {
        setError(err.message);
        if (err.message.toLowerCase().includes("auth")) {
          window.location.href = "/login";
        }
      });
  }, []);

  if (!user) return null;

  return (
    <section className="container-page space-y-6 py-8">
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold">Welcome, {user.fullName}</h1>
        <p className="mt-1 text-slate-600">Role: {user.role}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Available Courses</p>
          <p className="text-3xl font-bold text-brand-600">{courses.length}</p>
        </div>
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Progress Tracking</p>
          <p className="text-lg font-semibold">Enabled</p>
        </div>
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Next Action</p>
          <Link href="/courses" className="text-lg font-semibold text-brand-600">
            Browse courses
          </Link>
        </div>
      </div>

      {error ? <p className="text-red-600">{error}</p> : null}
    </section>
  );
}
