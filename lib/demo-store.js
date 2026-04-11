"use client";

import { useEffect, useMemo, useState } from "react";
import { defaultDemoData } from "@/lib/demo-data/defaults";
import { isLessonPublished, normalizeLessonAccessType } from "@/lib/lesson-utils";

const STORAGE_KEY = "yanfa_demo_cms_v1";
const SECTIONS = Object.keys(defaultDemoData);

function migrateLegacyData(data) {
  const next = { ...data };

  if (!Array.isArray(next.packages) && Array.isArray(next.courses)) {
    next.packages = next.courses.map((course, index) => ({
      id: course.id || `pkg-${index + 1}`,
      slug: course.slug || `package-${index + 1}`,
      title: course.title || "باقة أدبية",
      description: course.description || "",
      categoryId: course.categoryId || `cat-${(course.category || "عام").replace(/\s+/g, "-")}`,
      teacherId: course.teacherId || "",
      coverImage: course.coverImage || course.image || "",
      isPublished: course.isPublished ?? course.status === "published",
      isFeatured: course.isFeatured ?? course.featured ?? false,
      priceType: course.priceType || "free",
      priceMad: Number(course.priceMad) >= 0 ? Math.round(Number(course.priceMad)) : undefined,
      lessonsCount: course.lessonsCount ?? course.lessonCount ?? 0,
      order: course.order ?? index + 1,
      academicLevel: course.academicLevel || "الرابعة متوسط",
    }));
  }

  if (Array.isArray(next.packages)) {
    next.packages = next.packages.map((pkg) => {
      const pm = Number(pkg.priceMad);
      const hasPrice = Number.isFinite(pm) && pm >= 0;
      const fallbackPaid = pkg.priceType === "paid" || pkg.priceType === "premium" ? 299 : 0;
      return {
        ...pkg,
        priceMad: hasPrice ? Math.round(pm) : fallbackPaid,
        academicLevel: pkg.academicLevel || "الرابعة متوسط",
      };
    });
  }

  if (Array.isArray(next.lessons)) {
    next.lessons = next.lessons.map((lesson, index) => ({
      ...lesson,
      packageId: lesson.packageId || lesson.courseId || "",
      description: lesson.description || lesson.summary || "",
      order: lesson.order ?? index + 1,
      isPublished: isLessonPublished(lesson),
      accessType: normalizeLessonAccessType(lesson),
      academicLevel: lesson.academicLevel || "",
    }));
  }

  if (Array.isArray(next.categories)) {
    next.categories = next.categories.map((category, index) => ({
      id: category.id || `cat-${index + 1}`,
      name: category.name || category.title || "تصنيف أدبي",
      slug: category.slug || String(category.name || category.title || `category-${index + 1}`).replace(/\s+/g, "-"),
      description: category.description || "",
      active: category.active ?? true,
    }));
  }

  if (Array.isArray(next.students)) {
    next.students = next.students.map((s) => {
      const w = Number(s.walletBalance);
      return {
        ...s,
        walletBalance: Number.isFinite(w) && w >= 0 ? Math.round(w) : 0,
      };
    });
  }

  if (!Array.isArray(next.rechargeRequests)) next.rechargeRequests = [];
  if (!Array.isArray(next.walletTransactions)) next.walletTransactions = [];
  if (!Array.isArray(next.enrollments)) next.enrollments = [];

  return next;
}

/** Full snapshot read/write for wallet flows (single atomic updates). */
export function readDemoData() {
  return readAll();
}

export function writeDemoData(next) {
  writeAll(next);
}

function readAll() {
  if (typeof window === "undefined") return defaultDemoData;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw || raw === "undefined" || raw === "null") return defaultDemoData;
    const parsed = JSON.parse(raw);
    const merged = migrateLegacyData({ ...defaultDemoData, ...parsed });
    // Ensure every known section exists even if storage is partially corrupted.
    for (const key of SECTIONS) {
      if (merged[key] === undefined || merged[key] === null) {
        merged[key] = defaultDemoData[key];
      }
    }
    return merged;
  } catch {
    return defaultDemoData;
  }
}

function writeAll(nextValue) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(nextValue));
  window.dispatchEvent(new CustomEvent("yanfa-demo-data-updated"));
}

export function getSection(section) {
  const data = readAll();
  return data[section];
}

export function setSection(section, value) {
  const current = readAll();
  const nextValue = typeof value === "function" ? value(current[section]) : value;
  writeAll({ ...current, [section]: nextValue });
}

export function resetDemoData() {
  writeAll(defaultDemoData);
}

/** Stable snapshot for SSR + first client paint — must not read localStorage (hydration-safe). */
function getDefaultSectionSnapshot(section) {
  const raw = defaultDemoData[section];
  if (raw === undefined || raw === null) return raw;
  try {
    return structuredClone(raw);
  } catch {
    return JSON.parse(JSON.stringify(raw));
  }
}

export function useDemoSection(section) {
  const [value, setValue] = useState(() => getDefaultSectionSnapshot(section));

  useEffect(() => {
    const refresh = () => setValue(getSection(section));
    refresh();
    window.addEventListener("yanfa-demo-data-updated", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("yanfa-demo-data-updated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [section]);

  const update = useMemo(
    () => (nextValue) => {
      setSection(section, nextValue);
      const resolved = typeof nextValue === "function" ? nextValue(getSection(section)) : nextValue;
      setValue(resolved);
    },
    [section]
  );

  return [value, update];
}

export { SECTIONS };
