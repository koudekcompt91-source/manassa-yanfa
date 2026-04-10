"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { authStore } from "@/lib/auth";

export default function CourseDetailsPage() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [error, setError] = useState("");
  const [enrolling, setEnrolling] = useState(false);
  const user = useMemo(() => authStore.getUser(), []);

  useEffect(() => {
    Promise.all([apiRequest(`/courses/${id}`), apiRequest(`/lessons/course/${id}`)])
      .then(([courseRes, lessonsRes]) => {
        setCourse(courseRes.data);
        setLessons(lessonsRes.data || []);
      })
      .catch((err) => setError(err.message));
  }, [id]);

  const isEnrolled = useMemo(() => {
    if (!course || !user) return false;
    return (course.enrolledStudents || []).some((studentId) => studentId === user.id);
  }, [course, user]);

  const firstLessonId = lessons[0]?._id;

  const enroll = async () => {
    if (!user) {
      window.location.href = "/login";
      return;
    }

    try {
      setEnrolling(true);
      const res = await apiRequest(`/courses/${id}/enroll`, { method: "POST" });
      setCourse(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setEnrolling(false);
    }
  };

  if (error) return <p className="text-red-600">{error}</p>;
  if (!course) return <p>Loading course...</p>;

  return (
    <section className="space-y-6">
      <div className="rounded-xl border bg-white p-6">
        <p className="mb-2 text-sm uppercase tracking-wide text-brand-600">{course.level}</p>
        <h1 className="mb-2 text-3xl font-bold">{course.title}</h1>
        <p className="text-slate-600">{course.description}</p>
      </div>

      <div className="flex items-center gap-3">
        {!isEnrolled ? (
          <button
            onClick={enroll}
            disabled={enrolling}
            className="rounded-md bg-brand-600 px-4 py-2 text-white disabled:opacity-50"
          >
            {enrolling ? "Enrolling..." : "Enroll in Course"}
          </button>
        ) : (
          <span className="rounded-md bg-emerald-100 px-3 py-1.5 text-sm text-emerald-700">Enrolled</span>
        )}

        {firstLessonId ? (
          <Link
            href={`/courses/${id}/lesson/${firstLessonId}`}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm"
          >
            Start First Lesson
          </Link>
        ) : null}
      </div>

      <div className="rounded-xl border bg-white p-6">
        <h2 className="mb-4 text-xl font-semibold">Lessons</h2>
        {!lessons.length ? <p>No lessons available yet.</p> : null}
        <div className="space-y-2">
          {lessons.map((lesson) => (
            <Link
              key={lesson._id}
              href={`/courses/${id}/lesson/${lesson._id}`}
              className="block rounded-md border p-3 hover:bg-slate-50"
            >
              {lesson.order}. {lesson.title}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
