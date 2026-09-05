"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  FileText,
  Gamepad2,
  Lock,
  PlayCircle,
} from "lucide-react";
import FreeCourseVideoPlayer from "@/components/student/FreeCourseVideoPlayer";

const TONES = [
  "from-brand-600 to-indigo-600",
  "from-emerald-500 to-teal-600",
  "from-violet-600 to-indigo-700",
  "from-amber-500 to-orange-600",
  "from-sky-500 to-brand-600",
];

function toneAt(i) {
  return TONES[i % TONES.length];
}

function SectionHeading({ id, icon: Icon, title }) {
  return (
    <div id={id} className="mb-5 flex scroll-mt-24 items-center gap-2">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
        <Icon className="h-4 w-4" />
      </span>
      <h2 className="text-lg font-extrabold text-slate-900 sm:text-xl">{title}</h2>
    </div>
  );
}

export default function FreeDashboardPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/free/courses", { credentials: "include" })
      .then(async (r) => {
        const data = await r.json().catch(() => ({}));
        return { okHttp: r.ok, data };
      })
      .then(({ okHttp, data }) => {
        if (cancelled) return;

        // API already returns FREE_ALLOWED only — do not re-filter by system.
        const list = Array.isArray(data?.courses) ? data.courses : [];
        console.log("[free-dashboard] courses:", data);

        if (!okHttp || data?.ok === false) {
          setError(data?.message || "تعذّر تحميل الدورات.");
          setCourses([]);
          setSelectedId("");
          return;
        }

        setError("");
        setCourses(list);
        setSelectedId((prev) => {
          if (prev && list.some((c) => (c.id || c.slug) === prev)) return prev;
          return list[0]?.id || list[0]?.slug || "";
        });
      })
      .catch(() => {
        if (!cancelled) {
          setError("تعذّر الاتصال بالخادم.");
          setCourses([]);
          setSelectedId("");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const selected = useMemo(() => {
    if (!selectedId) return null;
    return courses.find((c) => (c.id || c.slug) === selectedId) || null;
  }, [courses, selectedId]);

  const selectedPdfs = Array.isArray(selected?.pdfs) ? selected.pdfs : [];

  function selectCourse(course) {
    const id = course?.id || course?.slug || "";
    if (!id) return;
    setSelectedId(id);
    const el = document.getElementById("video");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="w-full">
      <div className="mx-auto w-full max-w-3xl space-y-10 sm:space-y-12">
        <header className="rounded-2xl border border-slate-200/80 bg-white px-6 py-7 text-center shadow-[0_10px_28px_-20px_rgba(15,23,42,0.18)] sm:px-10 sm:py-8">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            مرحباً بك في الحساب المجاني
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-slate-500 sm:text-base">
            اختر دورة ثم شاهد الفيديو والمستندات المرتبطة بها.
          </p>
        </header>

        {/* 1. Courses — cards only */}
        <section aria-label="الدورات">
          <SectionHeading id="courses" icon={BookOpen} title="الدورات" />

          {loading ? (
            <div className="flex flex-col gap-5">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-36 animate-pulse rounded-2xl bg-slate-100" />
              ))}
            </div>
          ) : error ? (
            <p
              role="alert"
              className="rounded-2xl border border-red-200 bg-red-50 px-4 py-8 text-center text-sm font-semibold text-red-700"
            >
              {error}
            </p>
          ) : courses.length === 0 ? (
            <p
              role="status"
              className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-12 text-center text-sm font-semibold text-slate-500"
            >
              لا توجد دورات حالياً
            </p>
          ) : (
            <div className="flex flex-col gap-5 sm:gap-6">
              {courses.map((course, index) => {
                const id = course?.id || course?.slug || `course-${index}`;
                const title = course?.title || "دورة";
                const description =
                  String(course?.description || "")
                    .replace(/https?:\/\/[^\s"'<>]+\.pdf(?:\?[^\s"'<>]*)?/gi, "")
                    .trim() || "دورة مجانية — اضغط للمشاهدة.";
                const level = course?.academicLevel || course?.level || "";
                const isActive = selectedId === id;
                return (
                  <article
                    key={id}
                    className={`w-full rounded-2xl border bg-white p-5 shadow-[0_10px_28px_-18px_rgba(15,23,42,0.2)] transition sm:p-6 ${
                      isActive
                        ? "border-brand-400 ring-2 ring-brand-200"
                        : "border-slate-200/90 hover:-translate-y-0.5 hover:border-brand-300/50 hover:shadow-md"
                    }`}
                  >
                    <div dir="ltr" className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
                      <div
                        className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white sm:h-[5.5rem] sm:w-[5.5rem] ${toneAt(index)}`}
                      >
                        <PlayCircle className="h-9 w-9" strokeWidth={1.75} />
                      </div>
                      <div dir="rtl" className="min-w-0 flex-1 text-right">
                        <h3 className="text-xl font-extrabold text-slate-900 sm:text-[1.35rem]">{title}</h3>
                        <p className="mt-1.5 text-sm leading-7 text-slate-500 line-clamp-2">{description}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-extrabold text-emerald-800">
                            FREE
                          </span>
                          {level ? (
                            <span className="rounded-full bg-sky-100 px-2.5 py-1 text-[11px] font-extrabold text-sky-800">
                              {level}
                            </span>
                          ) : null}
                        </div>
                        <div className="mt-4">
                          <button
                            type="button"
                            onClick={() => selectCourse(course)}
                            className="touch-button-primary inline-flex h-11 w-full items-center justify-center px-5 text-sm font-extrabold sm:w-auto"
                          >
                            {isActive ? "محدّدة للعرض" : "اختيار الدورة"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* 2. Video — selected course only */}
        <section aria-label="الفيديو">
          <SectionHeading id="video" icon={PlayCircle} title="الفيديو" />
          {!selected ? (
            <p className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-10 text-center text-sm font-semibold text-slate-500">
              اختر دورة من القائمة لعرض الفيديو.
            </p>
          ) : (
            <div className="space-y-3">
              <p className="text-sm font-bold text-slate-700">{selected.title}</p>
              <FreeCourseVideoPlayer videoUrl={selected.videoUrl} title={selected.title} />
            </div>
          )}
        </section>

        {/* 3. PDF — only if selected course has PDFs */}
        {selected && selectedPdfs.length > 0 ? (
          <section aria-label="المستندات">
            <SectionHeading id="documents" icon={FileText} title="المستندات" />
            <ul className="flex flex-col gap-3">
              {selectedPdfs.map((pdf) => (
                <li key={pdf.id}>
                  <a
                    href={pdf.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/90 bg-white px-4 py-4 text-sm font-bold text-slate-800 shadow-sm transition hover:border-brand-300 hover:bg-brand-50/40"
                  >
                    <span className="inline-flex items-center gap-2">
                      <FileText className="h-4 w-4 text-red-600" />
                      {pdf.title || "مستند PDF"}
                    </span>
                    <span className="text-xs font-extrabold text-brand-700">فتح</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {/* 4. Games — always last, always locked */}
        <section aria-label="الألعاب">
          <SectionHeading id="games" icon={Gamepad2} title="الألعاب" />
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center">
            <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-200 text-slate-500">
              <Lock className="h-5 w-5" />
            </span>
            <p className="text-base font-extrabold text-slate-700">الألعاب التعليمية</p>
            <p className="mt-2 text-sm font-semibold text-slate-500">قريبًا — هذا القسم مقفل حاليًا.</p>
          </div>
        </section>
      </div>
    </div>
  );
}
