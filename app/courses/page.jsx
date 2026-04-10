"use client";

import { useEffect, useState } from "react";
import CourseCard from "@/components/CourseCard";
import { apiRequest } from "@/lib/api";

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiRequest("/courses?published=true")
      .then((res) => setCourses(res.data || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="container-page py-8">
      <h1 className="mb-6 text-3xl font-bold">Courses</h1>
      {loading ? <p>Loading courses...</p> : null}
      {error ? <p className="mb-4 text-red-600">{error}</p> : null}
      {!loading && !courses.length ? <p>No courses available yet.</p> : null}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <CourseCard key={course._id} course={course} />
        ))}
      </div>
    </section>
  );
}
