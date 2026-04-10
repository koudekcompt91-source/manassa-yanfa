"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import VideoPlayer from "@/components/VideoPlayer";

export default function LessonPage() {
  const { id, lessonId } = useParams();
  const router = useRouter();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [current, setCurrent] = useState(null);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(null);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    Promise.all([
      apiRequest(`/courses/${id}`),
      apiRequest(`/lessons/course/${id}`),
      apiRequest(`/progress/course/${id}`).catch(() => null),
    ])
      .then(([courseRes, lessonRes, progressRes]) => {
        const allLessons = lessonRes.data || [];
        const selected =
          allLessons.find((lesson) => lesson._id === lessonId || lesson.order?.toString() === lessonId) ||
          allLessons[0] ||
          null;
        setCourse(courseRes.data);
        setLessons(allLessons);
        setCurrent(selected);
        setProgress(progressRes?.data || null);
      })
      .catch((err) => setError(err.message));
  }, [id, lessonId]);

  const markComplete = async ({ silent = false } = {}) => {
    if (!current || completing) return;
    try {
      setCompleting(true);
      await apiRequest("/progress/complete-lesson", {
        method: "POST",
        body: JSON.stringify({ courseId: id, lessonId: current._id }),
      });
      const progressRes = await apiRequest(`/progress/course/${id}`);
      setProgress(progressRes.data);
      if (!silent) alert("Lesson marked as complete.");
    } catch (err) {
      if (!silent) alert(err.message);
    } finally {
      setCompleting(false);
    }
  };

  if (error) return <p className="text-red-600">{error}</p>;
  if (!course) return <p>Loading lesson...</p>;

  return (
    <section className="grid gap-6 lg:grid-cols-12">
      <div className="space-y-4 lg:col-span-8">
        <h1 className="text-3xl font-bold">{course.title}</h1>
        <p className="text-slate-600">{course.description}</p>
        <div className="aspect-video overflow-hidden rounded-xl bg-black shadow-lg">
          <VideoPlayer
            videoUrl={current?.videoUrl}
            title={current?.title}
            onEnded={() => markComplete({ silent: true })}
          />
        </div>
        <div className="rounded-xl border bg-white p-5">
          <h2 className="text-xl font-semibold">{current?.title || "Select a lesson"}</h2>
          <p className="mt-1 text-sm text-slate-500">
            Lesson {current?.order || "-"} - {current?.duration || 0} min
          </p>
          <div className="mt-4 space-y-3 text-slate-700">
            {(current?.description || "Lesson description will appear here.")
              .split(/\n+/)
              .filter(Boolean)
              .map((paragraph, index) => (
                <p key={`${index}-${paragraph.slice(0, 16)}`}>{paragraph}</p>
              ))}
          </div>
        </div>
        <div className="rounded-xl border bg-white p-5">
          <h3 className="text-lg font-semibold">Lesson PDF</h3>
          {current?.pdfUrl ? (
            <a
              href={current.pdfUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex rounded-md border border-brand-600 px-4 py-2 text-sm font-medium text-brand-700"
            >
              Open or Download PDF
            </a>
          ) : (
            <p className="mt-2 text-sm text-slate-500">No PDF attached for this lesson.</p>
          )}
        </div>
        <p className="text-sm text-slate-500">
          Progress: {progress?.completionPercentage ?? 0}% completed
        </p>
        <button
          onClick={() => markComplete()}
          disabled={completing}
          className="rounded-md bg-brand-600 px-4 py-2 text-white disabled:opacity-60"
        >
          {completing ? "Saving..." : "Mark as completed"}
        </button>
      </div>

      <aside className="rounded-xl border bg-white p-4 lg:col-span-4 lg:sticky lg:top-6 lg:h-fit">
        <h3 className="mb-1 text-lg font-semibold">Course Content</h3>
        <p className="mb-3 text-sm text-slate-500">Total lessons: {lessons.length}</p>
        <div className="space-y-2">
          {lessons.map((lesson) => (
            <button
              key={lesson._id}
              onClick={() => {
                setCurrent(lesson);
                router.push(`/courses/${id}/lesson/${lesson._id}`);
              }}
              className={`w-full rounded-md border p-2 text-left text-sm ${
                current?._id === lesson._id ? "border-brand-600 bg-brand-50" : ""
              }`}
            >
              <p className="font-medium">
                {lesson.order}. {lesson.title}
              </p>
              <p className="text-xs text-slate-500">{lesson.duration || 0} min</p>
            </button>
          ))}
        </div>
      </aside>
    </section>
  );
}
