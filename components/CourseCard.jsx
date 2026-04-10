import Link from "next/link";

export default function CourseCard({ course }) {
  return (
    <article className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="mb-2 text-xs uppercase tracking-wide text-brand-600">{course.level || "beginner"}</div>
      <h3 className="mb-2 text-xl font-semibold">{course.title}</h3>
      <p className="mb-4 text-sm text-slate-600">{course.description}</p>
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500">{course.category || "General"}</span>
        <Link
          href={`/courses/${course._id}`}
          className="rounded-md bg-brand-600 px-3 py-1.5 text-sm text-white"
        >
          View Course
        </Link>
      </div>
    </article>
  );
}
