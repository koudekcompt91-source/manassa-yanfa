"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import {
  AdminActionButton,
  AdminBadge,
  AdminEmptyState,
  AdminFormField,
  AdminInput,
  AdminSectionCard,
  AdminSelect,
  AdminToolbar,
} from "@/components/admin/AdminUI";
import { useDemoSection } from "@/lib/demo-store";
import { ACADEMIC_LEVELS, DEFAULT_ACADEMIC_LEVEL } from "@/lib/academic-levels";
import { STUDENT_LEVEL_SELECT_OPTIONS } from "@/lib/student-level-codes";
import { formatDzd } from "@/lib/format-money";

const EMPTY_COURSE_FORM = {
  title: "",
  description: "",
  categoryId: "",
  teacherId: "",
  thumbnailUrl: "",
  status: "DRAFT",
  accessType: "FREE",
  price: 0,
  academicLevel: DEFAULT_ACADEMIC_LEVEL,
  level: "",
};

const EMPTY_LESSON_FORM = {
  title: "",
  youtubeUrl: "",
  description: "",
  order: 1,
  isPublished: true,
  isFreePreview: false,
  durationSec: "",
};

const EMPTY_LIVE_SESSION_FORM = {
  title: "",
  description: "",
  zoomUrl: "",
  startsAt: "",
  durationMin: 60,
  status: "SCHEDULED",
  isPublished: true,
};

const EMPTY_ASSESSMENT_FORM = {
  title: "",
  description: "",
  type: "QUIZ",
  isPublished: false,
  dueDate: "",
  allowRetake: false,
};

const EMPTY_QUESTION_FORM = {
  questionText: "",
  type: "MULTIPLE_CHOICE",
  options: ["", ""],
  correctOption: 0,
  trueFalseAnswer: true,
  points: 1,
  order: 1,
};

export default function AdminPackagesPage() {
  const [categories] = useDemoSection("categories");
  const [teachers] = useDemoSection("teachers");

  const [courses, setCourses] = useState([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("الكل");
  const [categoryFilter, setCategoryFilter] = useState("الكل");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showCourseForm, setShowCourseForm] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [courseForm, setCourseForm] = useState(EMPTY_COURSE_FORM);
  const [savingCourse, setSavingCourse] = useState(false);
  const [courseFormError, setCourseFormError] = useState("");
  const [banner, setBanner] = useState({ type: "", text: "" });

  const [lessonModalOpen, setLessonModalOpen] = useState(false);
  const [lessonCourse, setLessonCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [lessonsLoading, setLessonsLoading] = useState(false);
  const [lessonForm, setLessonForm] = useState(EMPTY_LESSON_FORM);
  const [editingLessonId, setEditingLessonId] = useState(null);
  const [lessonError, setLessonError] = useState("");
  const [lessonSaving, setLessonSaving] = useState(false);
  const [managerTab, setManagerTab] = useState("RECORDED");
  const [liveSessions, setLiveSessions] = useState([]);
  const [liveSessionsLoading, setLiveSessionsLoading] = useState(false);
  const [liveSessionForm, setLiveSessionForm] = useState(EMPTY_LIVE_SESSION_FORM);
  const [editingLiveSessionId, setEditingLiveSessionId] = useState(null);
  const [liveSessionError, setLiveSessionError] = useState("");
  const [liveSessionSaving, setLiveSessionSaving] = useState(false);
  const [assessments, setAssessments] = useState([]);
  const [assessmentsLoading, setAssessmentsLoading] = useState(false);
  const [assessmentForm, setAssessmentForm] = useState(EMPTY_ASSESSMENT_FORM);
  const [editingAssessmentId, setEditingAssessmentId] = useState(null);
  const [assessmentError, setAssessmentError] = useState("");
  const [assessmentSaving, setAssessmentSaving] = useState(false);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState("");
  const [questions, setQuestions] = useState([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [questionForm, setQuestionForm] = useState(EMPTY_QUESTION_FORM);
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [questionError, setQuestionError] = useState("");
  const [questionSaving, setQuestionSaving] = useState(false);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [submissions, setSubmissions] = useState([]);

  const loadCourses = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/courses", { credentials: "include" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        setError(data?.message || "تعذّر تحميل الدورات.");
        setCourses([]);
        return;
      }
      setCourses(Array.isArray(data.courses) ? data.courses : []);
    } catch {
      setError("حدث خطأ أثناء تحميل الدورات.");
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  useEffect(() => {
    if (managerTab !== "ASSESSMENTS" || !selectedAssessmentId) return;
    loadQuestions(selectedAssessmentId);
    loadSubmissions(selectedAssessmentId);
  }, [managerTab, selectedAssessmentId]);

  const rows = useMemo(() => {
    return (courses || [])
      .map((course) => ({
        ...course,
        teacherName: (teachers || []).find((row) => row.id === course.teacherId)?.name || "-",
        categoryName: (categories || []).find((row) => row.id === course.categoryId)?.name || "-",
      }))
      .filter((course) => {
        const target = `${course.title} ${course.categoryName} ${course.teacherName}`.toLowerCase();
        const matchesQuery = target.includes(query.trim().toLowerCase());
        const matchesStatus =
          statusFilter === "الكل" ||
          (statusFilter === "published" ? course.status === "PUBLISHED" : course.status !== "PUBLISHED");
        const matchesCategory = categoryFilter === "الكل" || course.categoryId === categoryFilter;
        return matchesQuery && matchesStatus && matchesCategory;
      });
  }, [courses, categories, teachers, query, statusFilter, categoryFilter]);

  function resetCourseForm() {
    setCourseForm(EMPTY_COURSE_FORM);
    setEditingCourseId(null);
    setShowCourseForm(false);
    setCourseFormError("");
  }

  function openCreateForm() {
    setCourseForm({
      ...EMPTY_COURSE_FORM,
      categoryId: (categories || [])[0]?.id || "",
      teacherId: (teachers || [])[0]?.id || "",
    });
    setEditingCourseId(null);
    setShowCourseForm(true);
    setCourseFormError("");
  }

  function openEditForm(course) {
    setCourseForm({
      title: course.title || "",
      description: course.description || "",
      categoryId: course.categoryId || "",
      teacherId: course.teacherId || "",
      thumbnailUrl: course.coverImage || "",
      status: course.status || "DRAFT",
      accessType: course.accessType || "FREE",
      price: Number(course.price ?? course.priceMad ?? 0) || 0,
      academicLevel: course.academicLevel || DEFAULT_ACADEMIC_LEVEL,
      level: course.level || "",
    });
    setEditingCourseId(course.id);
    setShowCourseForm(true);
    setCourseFormError("");
  }

  async function saveCourse(e) {
    e.preventDefault();
    setCourseFormError("");
    setSavingCourse(true);
    try {
      if (!courseForm.title.trim()) {
        setCourseFormError("عنوان الدورة مطلوب.");
        return;
      }
      if (courseForm.accessType === "PAID" && (!(Number(courseForm.price) > 0) || !Number.isFinite(Number(courseForm.price)))) {
        setCourseFormError("أدخل سعرًا صحيحًا للدورة المدفوعة.");
        return;
      }

      const payload = {
        ...courseForm,
        price: courseForm.accessType === "PAID" ? Math.round(Number(courseForm.price) || 0) : 0,
      };

      const isEdit = !!editingCourseId;
      const url = isEdit ? `/api/admin/courses/${editingCourseId}` : "/api/admin/courses";
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        setCourseFormError(data?.message || "تعذّر حفظ الدورة.");
        return;
      }
      setBanner({ type: "success", text: data?.message || "تم حفظ الدورة بنجاح." });
      resetCourseForm();
      await loadCourses();
    } finally {
      setSavingCourse(false);
    }
  }

  async function deleteCourse(courseId) {
    const res = await fetch(`/api/admin/courses/${courseId}`, {
      method: "DELETE",
      credentials: "include",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.ok) {
      setBanner({ type: "error", text: data?.message || "تعذّر حذف الدورة." });
      return;
    }
    setBanner({ type: "success", text: "تم حذف الدورة." });
    await loadCourses();
  }

  async function togglePublish(course) {
    const nextStatus = course.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    const res = await fetch(`/api/admin/courses/${course.id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.ok) {
      setBanner({ type: "error", text: data?.message || "تعذّر تحديث حالة النشر." });
      return;
    }
    await loadCourses();
  }

  async function togglePriceType(course) {
    const nextAccessType = course.accessType === "PAID" ? "FREE" : "PAID";
    const nextPrice = nextAccessType === "FREE" ? 0 : Math.max(1, Number(course.price ?? course.priceMad ?? 100) || 100);
    const res = await fetch(`/api/admin/courses/${course.id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accessType: nextAccessType, price: nextPrice }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.ok) {
      setBanner({ type: "error", text: data?.message || "تعذّر تحديث نوع السعر." });
      return;
    }
    setBanner({
      type: "success",
      text: nextAccessType === "FREE" ? "تم تحويل الدورة إلى مجانية (السعر = 0)." : `تم تحويل الدورة إلى مدفوعة بسعر ${nextPrice} دج.`,
    });
    await loadCourses();
  }

  async function openLessonsManager(course) {
    setLessonCourse(course);
    setLessonModalOpen(true);
    setManagerTab("RECORDED");
    setEditingLessonId(null);
    setLessonForm(EMPTY_LESSON_FORM);
    setLessonError("");
    setEditingLiveSessionId(null);
    setLiveSessionForm(EMPTY_LIVE_SESSION_FORM);
    setLiveSessionError("");
    setEditingAssessmentId(null);
    setAssessmentForm(EMPTY_ASSESSMENT_FORM);
    setAssessmentError("");
    setAssessments([]);
    setSelectedAssessmentId("");
    setQuestions([]);
    setSubmissions([]);
    setLessonsLoading(true);
    setLiveSessionsLoading(true);
    setAssessmentsLoading(true);
    try {
      const [lessonsRes, sessionsRes, assessmentsRes] = await Promise.all([
        fetch(`/api/admin/courses/${course.id}/lessons`, { credentials: "include" }),
        fetch(`/api/admin/courses/${course.id}/live-sessions`, { credentials: "include" }),
        fetch(`/api/admin/courses/${course.id}/assessments`, { credentials: "include" }),
      ]);

      const lessonsData = await lessonsRes.json().catch(() => ({}));
      if (!lessonsRes.ok || !lessonsData?.ok) {
        setLessonError(lessonsData?.message || "تعذّر تحميل الدروس.");
        setLessons([]);
      } else {
        setLessons(Array.isArray(lessonsData.lessons) ? lessonsData.lessons : []);
      }

      const sessionsData = await sessionsRes.json().catch(() => ({}));
      if (!sessionsRes.ok || !sessionsData?.ok) {
        setLiveSessionError(sessionsData?.message || "تعذّر تحميل الحصص المباشرة.");
        setLiveSessions([]);
      } else {
        setLiveSessions(Array.isArray(sessionsData.liveSessions) ? sessionsData.liveSessions : []);
      }

      const assessmentsData = await assessmentsRes.json().catch(() => ({}));
      if (!assessmentsRes.ok || !assessmentsData?.ok) {
        setAssessmentError(assessmentsData?.message || "تعذّر تحميل الواجبات والاختبارات.");
        setAssessments([]);
      } else {
        const nextAssessments = Array.isArray(assessmentsData.assessments) ? assessmentsData.assessments : [];
        setAssessments(nextAssessments);
        if (nextAssessments[0]?.id) setSelectedAssessmentId(nextAssessments[0].id);
      }
    } finally {
      setLessonsLoading(false);
      setLiveSessionsLoading(false);
      setAssessmentsLoading(false);
    }
  }

  function openLessonEdit(lesson) {
    setEditingLessonId(lesson.id);
    setLessonForm({
      title: lesson.title || "",
      youtubeUrl: lesson.youtubeUrl || "",
      description: lesson.description || "",
      order: lesson.order || 1,
      isPublished: lesson.isPublished === true,
      isFreePreview: lesson.isFreePreview === true,
      durationSec: lesson.durationSec || "",
    });
    setLessonError("");
  }

  function resetLessonForm() {
    setEditingLessonId(null);
    setLessonForm({
      ...EMPTY_LESSON_FORM,
      order: lessons.length + 1,
    });
    setLessonError("");
  }

  async function saveLesson(e) {
    e.preventDefault();
    if (!lessonCourse) return;
    setLessonError("");
    setLessonSaving(true);
    try {
      const payload = {
        ...lessonForm,
        order: Math.max(1, Number(lessonForm.order) || 1),
        durationSec: lessonForm.durationSec === "" ? null : Math.max(0, Number(lessonForm.durationSec) || 0),
      };
      const isEdit = !!editingLessonId;
      const url = isEdit ? `/api/admin/lessons/${editingLessonId}` : `/api/admin/courses/${lessonCourse.id}/lessons`;
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        setLessonError(data?.message || "تعذّر حفظ الدرس.");
        return;
      }
      await openLessonsManager(lessonCourse);
      resetLessonForm();
    } finally {
      setLessonSaving(false);
    }
  }

  async function deleteLesson(lessonId) {
    const res = await fetch(`/api/admin/lessons/${lessonId}`, {
      method: "DELETE",
      credentials: "include",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.ok) {
      setLessonError(data?.message || "تعذّر حذف الدرس.");
      return;
    }
    if (lessonCourse) await openLessonsManager(lessonCourse);
  }

  async function moveLesson(lessonId, direction) {
    const idx = lessons.findIndex((lesson) => lesson.id === lessonId);
    if (idx < 0) return;
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= lessons.length) return;
    const next = [...lessons];
    const temp = next[idx];
    next[idx] = next[targetIdx];
    next[targetIdx] = temp;
    setLessons(next.map((lesson, i) => ({ ...lesson, order: i + 1 })));

    const res = await fetch(`/api/admin/courses/${lessonCourse.id}/lessons/reorder`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonIds: next.map((lesson) => lesson.id) }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.ok) {
      setLessonError(data?.message || "تعذّر حفظ ترتيب الدروس.");
      return;
    }
    await openLessonsManager(lessonCourse);
  }

  function openLiveSessionEdit(session) {
    const startsAtValue = session?.startsAt ? new Date(session.startsAt).toISOString().slice(0, 16) : "";
    setEditingLiveSessionId(session.id);
    setLiveSessionForm({
      title: session.title || "",
      description: session.description || "",
      zoomUrl: session.zoomUrl || "",
      startsAt: startsAtValue,
      durationMin: Number(session.durationMin || 60) || 60,
      status: session.status || "SCHEDULED",
      isPublished: session.isPublished === true,
    });
    setLiveSessionError("");
  }

  function resetLiveSessionForm() {
    setEditingLiveSessionId(null);
    setLiveSessionForm(EMPTY_LIVE_SESSION_FORM);
    setLiveSessionError("");
  }

  async function saveLiveSession(e) {
    e.preventDefault();
    if (!lessonCourse) return;
    setLiveSessionError("");
    setLiveSessionSaving(true);
    try {
      const payload = {
        ...liveSessionForm,
        durationMin: Math.max(1, Number(liveSessionForm.durationMin) || 1),
      };
      const isEdit = Boolean(editingLiveSessionId);
      const url = isEdit
        ? `/api/admin/live-sessions/${editingLiveSessionId}`
        : `/api/admin/courses/${lessonCourse.id}/live-sessions`;
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        setLiveSessionError(data?.message || "تعذّر حفظ الحصة المباشرة.");
        return;
      }
      await openLessonsManager(lessonCourse);
      setManagerTab("LIVE");
      resetLiveSessionForm();
    } finally {
      setLiveSessionSaving(false);
    }
  }

  async function deleteLiveSession(sessionId) {
    const res = await fetch(`/api/admin/live-sessions/${sessionId}`, {
      method: "DELETE",
      credentials: "include",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.ok) {
      setLiveSessionError(data?.message || "تعذّر حذف الحصة المباشرة.");
      return;
    }
    if (lessonCourse) {
      await openLessonsManager(lessonCourse);
      setManagerTab("LIVE");
    }
  }

  async function loadQuestions(assessmentId) {
    if (!assessmentId) return;
    setQuestionsLoading(true);
    setQuestionError("");
    try {
      const res = await fetch(`/api/admin/assessments/${assessmentId}/questions`, { credentials: "include" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        setQuestionError(data?.message || "تعذّر تحميل الأسئلة.");
        setQuestions([]);
        return;
      }
      setQuestions(Array.isArray(data.questions) ? data.questions : []);
    } finally {
      setQuestionsLoading(false);
    }
  }

  async function loadSubmissions(assessmentId) {
    if (!assessmentId) return;
    setSubmissionsLoading(true);
    try {
      const res = await fetch(`/api/admin/assessments/${assessmentId}/submissions`, { credentials: "include" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        setAssessmentError(data?.message || "تعذّر تحميل الإجابات.");
        setSubmissions([]);
        return;
      }
      setSubmissions(Array.isArray(data.submissions) ? data.submissions : []);
    } finally {
      setSubmissionsLoading(false);
    }
  }

  async function saveAssessment(e) {
    e.preventDefault();
    if (!lessonCourse) return;
    setAssessmentError("");
    setAssessmentSaving(true);
    try {
      const payload = {
        ...assessmentForm,
        dueDate: assessmentForm.dueDate || null,
      };
      const isEdit = Boolean(editingAssessmentId);
      const url = isEdit ? `/api/admin/assessments/${editingAssessmentId}` : `/api/admin/courses/${lessonCourse.id}/assessments`;
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        setAssessmentError(data?.message || "تعذّر حفظ الواجب/الاختبار.");
        return;
      }
      await openLessonsManager(lessonCourse);
      setManagerTab("ASSESSMENTS");
      setEditingAssessmentId(null);
      setAssessmentForm(EMPTY_ASSESSMENT_FORM);
      if (data?.assessment?.id) setSelectedAssessmentId(data.assessment.id);
    } finally {
      setAssessmentSaving(false);
    }
  }

  function openAssessmentEdit(assessment) {
    setEditingAssessmentId(assessment.id);
    setAssessmentForm({
      title: assessment.title || "",
      description: assessment.description || "",
      type: assessment.type || "QUIZ",
      isPublished: assessment.isPublished === true,
      dueDate: assessment.dueDate ? new Date(assessment.dueDate).toISOString().slice(0, 16) : "",
      allowRetake: assessment.allowRetake === true,
    });
    setAssessmentError("");
  }

  async function deleteAssessment(assessmentId) {
    const res = await fetch(`/api/admin/assessments/${assessmentId}`, {
      method: "DELETE",
      credentials: "include",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.ok) {
      setAssessmentError(data?.message || "تعذّر حذف الواجب/الاختبار.");
      return;
    }
    if (lessonCourse) {
      await openLessonsManager(lessonCourse);
      setManagerTab("ASSESSMENTS");
    }
  }

  async function toggleAssessmentPublish(assessment) {
    const res = await fetch(`/api/admin/assessments/${assessment.id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: !assessment.isPublished }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.ok) {
      setAssessmentError(data?.message || "تعذّر تحديث حالة النشر.");
      return;
    }
    if (lessonCourse) {
      await openLessonsManager(lessonCourse);
      setManagerTab("ASSESSMENTS");
      setSelectedAssessmentId(assessment.id);
    }
  }

  function openQuestionEdit(question) {
    const options = Array.isArray(question.options) && question.options.length ? question.options.map((v) => String(v)) : ["", ""];
    setEditingQuestionId(question.id);
    setQuestionForm({
      questionText: question.questionText || "",
      type: question.type || "MULTIPLE_CHOICE",
      options,
      correctOption: Number(question?.correctAnswer?.correctOption ?? 0) || 0,
      trueFalseAnswer: Boolean(question?.correctAnswer?.value ?? true),
      points: Number(question.points || 1) || 1,
      order: Number(question.order || 1) || 1,
    });
    setQuestionError("");
  }

  function resetQuestionForm() {
    setEditingQuestionId(null);
    setQuestionForm(EMPTY_QUESTION_FORM);
    setQuestionError("");
  }

  async function saveQuestion(e) {
    e.preventDefault();
    if (!selectedAssessmentId) return;
    setQuestionError("");
    setQuestionSaving(true);
    try {
      const payload = {
        questionText: questionForm.questionText,
        type: questionForm.type,
        points: Math.max(0, Number(questionForm.points) || 0),
        order: Math.max(1, Number(questionForm.order) || 1),
        options: questionForm.type === "MULTIPLE_CHOICE" ? questionForm.options : null,
        correctOption: questionForm.type === "MULTIPLE_CHOICE" ? Number(questionForm.correctOption) || 0 : null,
        correctAnswer: questionForm.type === "TRUE_FALSE" ? Boolean(questionForm.trueFalseAnswer) : null,
      };
      const isEdit = Boolean(editingQuestionId);
      const url = isEdit
        ? `/api/admin/assessment-questions/${editingQuestionId}`
        : `/api/admin/assessments/${selectedAssessmentId}/questions`;
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        setQuestionError(data?.message || "تعذّر حفظ السؤال.");
        return;
      }
      await loadQuestions(selectedAssessmentId);
      resetQuestionForm();
    } finally {
      setQuestionSaving(false);
    }
  }

  async function deleteQuestion(questionId) {
    const res = await fetch(`/api/admin/assessment-questions/${questionId}`, {
      method: "DELETE",
      credentials: "include",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.ok) {
      setQuestionError(data?.message || "تعذّر حذف السؤال.");
      return;
    }
    await loadQuestions(selectedAssessmentId);
  }

  async function saveSubmissionCorrection(submission) {
    const answers = (submission.answers || []).map((ans) => ({
      answerId: ans.id,
      pointsAwarded: Number(ans.pointsAwarded || 0),
      correctionNote: ans.correctionNote || "",
    }));
    const res = await fetch(`/api/admin/submissions/${submission.id}/correct`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers, scoreOverride: submission.score }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.ok) {
      setAssessmentError(data?.message || "تعذّر حفظ التصحيح.");
      return;
    }
    await loadSubmissions(selectedAssessmentId);
  }

  function shortText(value, max = 96) {
    const s = String(value || "").trim();
    if (!s) return "بدون وصف.";
    return s.length > max ? `${s.slice(0, max)}...` : s;
  }

  function liveStatusMeta(status) {
    if (status === "LIVE") return { label: "مباشر الآن", tone: "success" };
    if (status === "ENDED") return { label: "انتهت", tone: "warning" };
    if (status === "CANCELLED") return { label: "ملغاة", tone: "warning" };
    return { label: "قادمة", tone: "brand" };
  }

  return (
    <AdminShell title="إدارة الدورات" subtitle="إنشاء الدورات وربطها بالمحتوى والدروس داخل المنصة.">
      <AdminSectionCard title="إدارة الدورات" subtitle="أنشئ دورة مجانية أو مدفوعة ثم أضف الدروس المرتبطة بها.">
        {banner.text ? (
          <div className={`mb-4 rounded-xl border px-3 py-2 text-sm ${banner.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-700"}`}>
            {banner.text}
          </div>
        ) : null}
        {error ? <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}

        <AdminToolbar>
          <AdminInput type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ابحث عن دورة..." />
          <AdminSelect value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="الكل">كل التصنيفات</option>
            {(categories || []).map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </AdminSelect>
          <AdminSelect value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="الكل">كل الحالات</option>
            <option value="published">منشورة</option>
            <option value="draft">مسودة</option>
          </AdminSelect>
          {!showCourseForm ? (
            <AdminActionButton onClick={openCreateForm} tone="primary" className="rounded-xl px-4 py-2 text-sm font-bold">
              إضافة دورة جديدة
            </AdminActionButton>
          ) : (
            <span className="self-center text-xs font-semibold text-brand-700">{editingCourseId ? "تعديل الدورة" : "إضافة دورة جديدة"}</span>
          )}
        </AdminToolbar>

        {showCourseForm ? (
          <form className="mb-6 grid gap-4 rounded-2xl border border-slate-200/80 bg-slate-50/60 p-5 md:grid-cols-2 xl:gap-5" onSubmit={saveCourse}>
            <AdminFormField label="عنوان الدورة">
              <AdminInput value={courseForm.title} onChange={(e) => setCourseForm((s) => ({ ...s, title: e.target.value }))} placeholder="عنوان الدورة" required />
            </AdminFormField>
            <AdminFormField label="الوصف">
              <AdminInput value={courseForm.description} onChange={(e) => setCourseForm((s) => ({ ...s, description: e.target.value }))} placeholder="وصف الدورة" />
            </AdminFormField>
            <AdminFormField label="التصنيف">
              <AdminSelect value={courseForm.categoryId} onChange={(e) => setCourseForm((s) => ({ ...s, categoryId: e.target.value }))}>
                <option value="">بدون تصنيف</option>
                {(categories || []).map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </AdminSelect>
            </AdminFormField>
            <AdminFormField label="الأستاذ">
              <AdminSelect value={courseForm.teacherId} onChange={(e) => setCourseForm((s) => ({ ...s, teacherId: e.target.value }))}>
                <option value="">بدون أستاذ محدد</option>
                {(teachers || []).map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.name}
                  </option>
                ))}
              </AdminSelect>
            </AdminFormField>
            <AdminFormField label="رابط صورة الدورة">
              <AdminInput value={courseForm.thumbnailUrl} onChange={(e) => setCourseForm((s) => ({ ...s, thumbnailUrl: e.target.value }))} placeholder="https://..." />
            </AdminFormField>
            <AdminFormField label="حالة الدورة">
              <AdminSelect value={courseForm.status} onChange={(e) => setCourseForm((s) => ({ ...s, status: e.target.value }))}>
                <option value="DRAFT">مسودة</option>
                <option value="PUBLISHED">منشورة</option>
              </AdminSelect>
            </AdminFormField>
            <AdminFormField label="نوع السعر">
              <AdminSelect
                value={courseForm.accessType}
                onChange={(e) =>
                  setCourseForm((s) => ({
                    ...s,
                    accessType: e.target.value,
                    price: e.target.value === "PAID" ? s.price || 1 : 0,
                  }))
                }
              >
                <option value="FREE">مجانية</option>
                <option value="PAID">مدفوعة</option>
              </AdminSelect>
            </AdminFormField>
            {courseForm.accessType === "PAID" ? (
              <AdminFormField label="السعر">
                <AdminInput
                  type="number"
                  min="1"
                  value={courseForm.price}
                  onChange={(e) => setCourseForm((s) => ({ ...s, price: Number(e.target.value) || 0 }))}
                  required
                />
              </AdminFormField>
            ) : (
              <AdminFormField label="السعر">
                <AdminInput value="0" disabled readOnly />
              </AdminFormField>
            )}
            <AdminFormField label="المستوى الدراسي">
              <AdminSelect value={courseForm.academicLevel} onChange={(e) => setCourseForm((s) => ({ ...s, academicLevel: e.target.value }))}>
                {ACADEMIC_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </AdminSelect>
            </AdminFormField>
            <AdminFormField label="رمز المستوى (اختياري)">
              <AdminSelect value={courseForm.level} onChange={(e) => setCourseForm((s) => ({ ...s, level: e.target.value }))}>
                <option value="">بدون رمز</option>
                {STUDENT_LEVEL_SELECT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </AdminSelect>
            </AdminFormField>
            {courseFormError ? <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 md:col-span-2">{courseFormError}</p> : null}
            <div className="flex flex-wrap gap-2 md:col-span-2">
              <AdminActionButton type="submit" tone="primary" className="rounded-xl px-4 py-2 text-sm font-bold" disabled={savingCourse}>
                {savingCourse ? "جاري الحفظ..." : "حفظ الدورة"}
              </AdminActionButton>
              <AdminActionButton type="button" onClick={resetCourseForm} className="rounded-xl px-4 py-2 text-sm font-bold">
                إلغاء
              </AdminActionButton>
            </div>
          </form>
        ) : null}

        {loading ? <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">جاري تحميل الدورات...</p> : null}
        {!loading && !rows.length ? (
          <AdminEmptyState title="لا توجد دورات" description="ابدأ بإنشاء دورة جديدة ثم أضف دروسها." />
        ) : null}
        {!loading && rows.length ? (
          <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-right text-xs font-semibold tracking-wide text-slate-500">
                  <th className="px-4 py-3">الدورة</th>
                  <th className="px-3 py-3">التصنيف</th>
                  <th className="px-3 py-3">الأستاذ</th>
                  <th className="px-3 py-3">الدروس</th>
                  <th className="px-3 py-3">السعر</th>
                  <th className="px-3 py-3">الحالة</th>
                  <th className="px-4 py-3">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((course) => (
                  <tr key={course.id} className="border-b border-slate-100 align-top text-slate-700 transition hover:bg-slate-50/50">
                    <td className="px-4 py-4">
                      <p className="font-semibold text-slate-900">{course.title}</p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">{shortText(course.description)}</p>
                    </td>
                    <td className="px-3 py-4">{course.categoryName}</td>
                    <td className="px-3 py-4">{course.teacherName}</td>
                    <td className="px-3 py-4 font-semibold">{course.lessonsCount ?? 0}</td>
                    <td className="px-3 py-4">
                      <span className={`rounded-full px-2 py-1 text-xs font-semibold ${course.accessType === "PAID" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-700"}`}>
                        {course.accessType === "PAID" ? "مدفوعة" : "مجانية"}
                      </span>
                      <span className="mt-1 block font-semibold text-slate-900">{formatDzd(Number(course.price ?? course.priceMad ?? 0))}</span>
                    </td>
                    <td className="px-3 py-4">
                      <AdminBadge tone={course.status === "PUBLISHED" ? "success" : "warning"}>{course.status === "PUBLISHED" ? "منشورة" : "مسودة"}</AdminBadge>
                    </td>
                    <td className="px-4 py-4">
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-2">
                          <AdminActionButton onClick={() => openEditForm(course)}>تعديل</AdminActionButton>
                          <AdminActionButton onClick={() => openLessonsManager(course)} tone="primary">
                            إدارة الدروس
                          </AdminActionButton>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <AdminActionButton onClick={() => togglePriceType(course)}>تغيير السعر</AdminActionButton>
                          <AdminActionButton onClick={() => togglePublish(course)}>تغيير الحالة</AdminActionButton>
                          <AdminActionButton onClick={() => deleteCourse(course.id)} tone="danger">
                            حذف
                          </AdminActionButton>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </AdminSectionCard>

      {lessonModalOpen && lessonCourse ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4">
          <div className="w-full max-w-5xl rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">إدارة الدروس: {lessonCourse.title}</h2>
                <p className="mt-1 text-sm text-slate-600">أضف الدروس ورتّبها لتظهر للطالب كتسلسل منهجي داخل الدورة.</p>
              </div>
              <AdminActionButton onClick={() => setLessonModalOpen(false)}>إغلاق</AdminActionButton>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <AdminActionButton
                onClick={() => setManagerTab("RECORDED")}
                tone={managerTab === "RECORDED" ? "primary" : undefined}
              >
                الدروس المسجلة
              </AdminActionButton>
              <AdminActionButton
                onClick={() => setManagerTab("LIVE")}
                tone={managerTab === "LIVE" ? "primary" : undefined}
              >
                الحصص المباشرة
              </AdminActionButton>
              <AdminActionButton
                onClick={() => setManagerTab("ASSESSMENTS")}
                tone={managerTab === "ASSESSMENTS" ? "primary" : undefined}
              >
                الواجبات والاختبارات
              </AdminActionButton>
            </div>

            {managerTab === "RECORDED" ? (
              <>
                <form className="mt-4 grid gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-4 md:grid-cols-2" onSubmit={saveLesson}>
                  <AdminFormField label="عنوان الدرس">
                    <AdminInput value={lessonForm.title} onChange={(e) => setLessonForm((s) => ({ ...s, title: e.target.value }))} required />
                  </AdminFormField>
                  <AdminFormField label="رابط يوتيوب">
                    <AdminInput value={lessonForm.youtubeUrl} onChange={(e) => setLessonForm((s) => ({ ...s, youtubeUrl: e.target.value }))} placeholder="https://youtube.com/watch?v=..." required />
                  </AdminFormField>
                  <AdminFormField label="الوصف (اختياري)">
                    <AdminInput value={lessonForm.description} onChange={(e) => setLessonForm((s) => ({ ...s, description: e.target.value }))} />
                  </AdminFormField>
                  <AdminFormField label="الترتيب">
                    <AdminInput type="number" min="1" value={lessonForm.order} onChange={(e) => setLessonForm((s) => ({ ...s, order: Number(e.target.value) || 1 }))} />
                  </AdminFormField>
                  <AdminFormField label="المدة بالثواني (اختياري)">
                    <AdminInput type="number" min="0" value={lessonForm.durationSec} onChange={(e) => setLessonForm((s) => ({ ...s, durationSec: e.target.value }))} />
                  </AdminFormField>
                  <AdminFormField label="الحالة">
                    <AdminSelect value={lessonForm.isPublished ? "1" : "0"} onChange={(e) => setLessonForm((s) => ({ ...s, isPublished: e.target.value === "1" }))}>
                      <option value="1">منشور</option>
                      <option value="0">مخفي</option>
                    </AdminSelect>
                  </AdminFormField>
                  <AdminFormField label="معاينة مجانية">
                    <AdminSelect value={lessonForm.isFreePreview ? "1" : "0"} onChange={(e) => setLessonForm((s) => ({ ...s, isFreePreview: e.target.value === "1" }))}>
                      <option value="0">لا</option>
                      <option value="1">نعم</option>
                    </AdminSelect>
                  </AdminFormField>
                  {lessonError ? <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 md:col-span-2">{lessonError}</p> : null}
                  <div className="flex flex-wrap gap-2 md:col-span-2">
                    <AdminActionButton type="submit" tone="primary" disabled={lessonSaving}>
                      {lessonSaving ? "جاري الحفظ..." : editingLessonId ? "تحديث الدرس" : "إضافة درس"}
                    </AdminActionButton>
                    {editingLessonId ? (
                      <AdminActionButton type="button" onClick={resetLessonForm}>
                        إلغاء التعديل
                      </AdminActionButton>
                    ) : null}
                  </div>
                </form>

                {lessonsLoading ? <p className="mt-4 text-sm text-slate-600">جاري تحميل الدروس...</p> : null}
                {!lessonsLoading && !lessons.length ? <p className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">لا توجد دروس بعد. أضف أول درس للدورة.</p> : null}
                {!lessonsLoading && lessons.length ? (
                  <div className="mt-4 space-y-2">
                    {lessons.map((lesson, idx) => (
                      <div key={lesson.id} className="flex flex-wrap items-start justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm">
                        <div>
                          <p className="font-semibold text-slate-900">
                            {idx + 1}. {lesson.title}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">{lesson.youtubeUrl}</p>
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <AdminBadge tone={lesson.isPublished ? "success" : "warning"}>{lesson.isPublished ? "منشور" : "مخفي"}</AdminBadge>
                            {lesson.isFreePreview ? <AdminBadge tone="brand">معاينة مجانية</AdminBadge> : null}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <AdminActionButton onClick={() => moveLesson(lesson.id, "up")} disabled={idx === 0}>رفع</AdminActionButton>
                          <AdminActionButton onClick={() => moveLesson(lesson.id, "down")} disabled={idx === lessons.length - 1}>خفض</AdminActionButton>
                          <AdminActionButton onClick={() => openLessonEdit(lesson)}>تعديل</AdminActionButton>
                          <AdminActionButton onClick={() => deleteLesson(lesson.id)} tone="danger">حذف</AdminActionButton>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </>
            ) : managerTab === "LIVE" ? (
              <>
                <form className="mt-4 grid gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-4 md:grid-cols-2" onSubmit={saveLiveSession}>
                  <AdminFormField label="عنوان الحصة">
                    <AdminInput value={liveSessionForm.title} onChange={(e) => setLiveSessionForm((s) => ({ ...s, title: e.target.value }))} required />
                  </AdminFormField>
                  <AdminFormField label="رابط Zoom">
                    <AdminInput
                      value={liveSessionForm.zoomUrl}
                      onChange={(e) => setLiveSessionForm((s) => ({ ...s, zoomUrl: e.target.value }))}
                      placeholder="https://zoom.us/j/..."
                      required
                    />
                  </AdminFormField>
                  <AdminFormField label="الوصف (اختياري)">
                    <AdminInput value={liveSessionForm.description} onChange={(e) => setLiveSessionForm((s) => ({ ...s, description: e.target.value }))} />
                  </AdminFormField>
                  <AdminFormField label="تاريخ ووقت البداية">
                    <AdminInput
                      type="datetime-local"
                      value={liveSessionForm.startsAt}
                      onChange={(e) => setLiveSessionForm((s) => ({ ...s, startsAt: e.target.value }))}
                      required
                    />
                  </AdminFormField>
                  <AdminFormField label="المدة بالدقائق">
                    <AdminInput
                      type="number"
                      min="1"
                      value={liveSessionForm.durationMin}
                      onChange={(e) => setLiveSessionForm((s) => ({ ...s, durationMin: Number(e.target.value) || 1 }))}
                      required
                    />
                  </AdminFormField>
                  <AdminFormField label="الحالة">
                    <AdminSelect value={liveSessionForm.status} onChange={(e) => setLiveSessionForm((s) => ({ ...s, status: e.target.value }))}>
                      <option value="SCHEDULED">قادمة</option>
                      <option value="LIVE">مباشر الآن</option>
                      <option value="ENDED">انتهت</option>
                      <option value="CANCELLED">ملغاة</option>
                    </AdminSelect>
                  </AdminFormField>
                  <AdminFormField label="النشر">
                    <AdminSelect
                      value={liveSessionForm.isPublished ? "1" : "0"}
                      onChange={(e) => setLiveSessionForm((s) => ({ ...s, isPublished: e.target.value === "1" }))}
                    >
                      <option value="1">منشورة</option>
                      <option value="0">مخفية</option>
                    </AdminSelect>
                  </AdminFormField>
                  {liveSessionError ? <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 md:col-span-2">{liveSessionError}</p> : null}
                  <div className="flex flex-wrap gap-2 md:col-span-2">
                    <AdminActionButton type="submit" tone="primary" disabled={liveSessionSaving}>
                      {liveSessionSaving ? "جاري الحفظ..." : editingLiveSessionId ? "تحديث الحصة" : "إضافة حصة مباشرة"}
                    </AdminActionButton>
                    {editingLiveSessionId ? (
                      <AdminActionButton type="button" onClick={resetLiveSessionForm}>
                        إلغاء التعديل
                      </AdminActionButton>
                    ) : null}
                  </div>
                </form>

                {liveSessionsLoading ? <p className="mt-4 text-sm text-slate-600">جاري تحميل الحصص المباشرة...</p> : null}
                {!liveSessionsLoading && !liveSessions.length ? (
                  <p className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                    لا توجد حصص مباشرة بعد.
                  </p>
                ) : null}
                {!liveSessionsLoading && liveSessions.length ? (
                  <div className="mt-4 space-y-2">
                    {liveSessions.map((session) => {
                      const meta = liveStatusMeta(session.status);
                      return (
                        <div key={session.id} className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm">
                          <div>
                            <p className="font-semibold text-slate-900">{session.title}</p>
                            <p className="mt-1 text-xs text-slate-500">
                              {new Date(session.startsAt).toLocaleString("ar-DZ")} - {session.durationMin} دقيقة
                            </p>
                            <p className="mt-1 text-xs text-slate-500">{session.zoomUrl}</p>
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                              <AdminBadge tone={meta.tone}>{meta.label}</AdminBadge>
                              <AdminBadge tone={session.isPublished ? "success" : "warning"}>
                                {session.isPublished ? "منشورة" : "مخفية"}
                              </AdminBadge>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <AdminActionButton onClick={() => openLiveSessionEdit(session)}>تعديل</AdminActionButton>
                            <AdminActionButton onClick={() => deleteLiveSession(session.id)} tone="danger">حذف</AdminActionButton>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : null}
              </>
            ) : (
              <>
                <form className="mt-4 grid gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-4 md:grid-cols-2" onSubmit={saveAssessment}>
                  <AdminFormField label="العنوان">
                    <AdminInput value={assessmentForm.title} onChange={(e) => setAssessmentForm((s) => ({ ...s, title: e.target.value }))} required />
                  </AdminFormField>
                  <AdminFormField label="النوع">
                    <AdminSelect value={assessmentForm.type} onChange={(e) => setAssessmentForm((s) => ({ ...s, type: e.target.value }))}>
                      <option value="QUIZ">اختبار</option>
                      <option value="ASSIGNMENT">واجب</option>
                    </AdminSelect>
                  </AdminFormField>
                  <AdminFormField label="الوصف (اختياري)">
                    <AdminInput value={assessmentForm.description} onChange={(e) => setAssessmentForm((s) => ({ ...s, description: e.target.value }))} />
                  </AdminFormField>
                  <AdminFormField label="تاريخ الاستحقاق (اختياري)">
                    <AdminInput type="datetime-local" value={assessmentForm.dueDate} onChange={(e) => setAssessmentForm((s) => ({ ...s, dueDate: e.target.value }))} />
                  </AdminFormField>
                  <AdminFormField label="إعادة المحاولة">
                    <AdminSelect value={assessmentForm.allowRetake ? "1" : "0"} onChange={(e) => setAssessmentForm((s) => ({ ...s, allowRetake: e.target.value === "1" }))}>
                      <option value="0">لا</option>
                      <option value="1">نعم</option>
                    </AdminSelect>
                  </AdminFormField>
                  <AdminFormField label="النشر">
                    <AdminSelect value={assessmentForm.isPublished ? "1" : "0"} onChange={(e) => setAssessmentForm((s) => ({ ...s, isPublished: e.target.value === "1" }))}>
                      <option value="1">منشور</option>
                      <option value="0">مخفي</option>
                    </AdminSelect>
                  </AdminFormField>
                  {assessmentError ? <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 md:col-span-2">{assessmentError}</p> : null}
                  <div className="flex flex-wrap gap-2 md:col-span-2">
                    <AdminActionButton type="submit" tone="primary" disabled={assessmentSaving}>
                      {assessmentSaving ? "جاري الحفظ..." : editingAssessmentId ? "تحديث التقييم" : assessmentForm.type === "QUIZ" ? "إضافة اختبار" : "إضافة واجب"}
                    </AdminActionButton>
                    {editingAssessmentId ? (
                      <AdminActionButton type="button" onClick={() => { setEditingAssessmentId(null); setAssessmentForm(EMPTY_ASSESSMENT_FORM); }}>
                        إلغاء
                      </AdminActionButton>
                    ) : null}
                  </div>
                </form>

                {assessmentsLoading ? <p className="mt-4 text-sm text-slate-600">جاري تحميل الواجبات والاختبارات...</p> : null}
                {!assessmentsLoading && !assessments.length ? <p className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">لا توجد عناصر بعد.</p> : null}
                {!assessmentsLoading && assessments.length ? (
                  <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_1fr]">
                    <div className="space-y-2">
                      {assessments.map((assessment) => (
                        <div key={assessment.id} className={`rounded-xl border px-3 py-3 text-sm ${selectedAssessmentId === assessment.id ? "border-brand-500 bg-brand-50/30" : "border-slate-200 bg-white"}`}>
                          <p className="font-semibold text-slate-900">{assessment.title}</p>
                          <p className="mt-1 text-xs text-slate-500">{assessment.type === "QUIZ" ? "اختبار" : "واجب"} - {assessment.questionsCount} سؤال</p>
                          <p className="mt-1 text-xs text-slate-500">الموعد: {assessment.dueDate ? new Date(assessment.dueDate).toLocaleString("ar-DZ") : "بدون تاريخ"}</p>
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <AdminBadge tone={assessment.isPublished ? "success" : "warning"}>{assessment.isPublished ? "منشور" : "مخفي"}</AdminBadge>
                            <AdminBadge tone="brand">الإجابات: {assessment.submissionsCount}</AdminBadge>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <AdminActionButton onClick={() => { setSelectedAssessmentId(assessment.id); loadQuestions(assessment.id); loadSubmissions(assessment.id); }}>عرض الإجابات</AdminActionButton>
                            <AdminActionButton onClick={() => openAssessmentEdit(assessment)}>تعديل</AdminActionButton>
                            <AdminActionButton onClick={() => toggleAssessmentPublish(assessment)}>{assessment.isPublished ? "إلغاء النشر" : "نشر"}</AdminActionButton>
                            <AdminActionButton onClick={() => deleteAssessment(assessment.id)} tone="danger">حذف</AdminActionButton>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/40 p-3">
                      <h3 className="text-sm font-extrabold text-slate-900">الأسئلة والإجابات</h3>
                      {!selectedAssessmentId ? <p className="text-xs text-slate-500">اختر تقييمًا لعرض الأسئلة والإجابات.</p> : null}
                      {selectedAssessmentId ? (
                        <>
                          <form className="grid gap-2 rounded-xl border border-slate-200 bg-white p-3" onSubmit={saveQuestion}>
                            <AdminFormField label="نص السؤال">
                              <AdminInput value={questionForm.questionText} onChange={(e) => setQuestionForm((s) => ({ ...s, questionText: e.target.value }))} required />
                            </AdminFormField>
                            <div className="grid gap-2 md:grid-cols-3">
                              <AdminFormField label="النوع">
                                <AdminSelect value={questionForm.type} onChange={(e) => setQuestionForm((s) => ({ ...s, type: e.target.value }))}>
                                  <option value="MULTIPLE_CHOICE">اختيار متعدد</option>
                                  <option value="TRUE_FALSE">صح/خطأ</option>
                                  <option value="WRITTEN">سؤال كتابي</option>
                                </AdminSelect>
                              </AdminFormField>
                              <AdminFormField label="النقاط">
                                <AdminInput type="number" min="0" value={questionForm.points} onChange={(e) => setQuestionForm((s) => ({ ...s, points: Number(e.target.value) || 0 }))} />
                              </AdminFormField>
                              <AdminFormField label="الترتيب">
                                <AdminInput type="number" min="1" value={questionForm.order} onChange={(e) => setQuestionForm((s) => ({ ...s, order: Number(e.target.value) || 1 }))} />
                              </AdminFormField>
                            </div>
                            {questionForm.type === "MULTIPLE_CHOICE" ? (
                              <div className="space-y-2">
                                <p className="text-xs font-semibold text-slate-700">خيارات السؤال</p>
                                {(questionForm.options || []).map((opt, i) => (
                                  <div key={`opt-${i}`} className="flex items-center gap-2">
                                    <input type="radio" checked={Number(questionForm.correctOption) === i} onChange={() => setQuestionForm((s) => ({ ...s, correctOption: i }))} />
                                    <AdminInput value={opt} onChange={(e) => setQuestionForm((s) => ({ ...s, options: s.options.map((o, idx) => (idx === i ? e.target.value : o)) }))} placeholder={`الخيار ${i + 1}`} />
                                    <AdminActionButton type="button" onClick={() => setQuestionForm((s) => ({ ...s, options: s.options.filter((_, idx) => idx !== i), correctOption: Math.max(0, Math.min(Number(s.correctOption) || 0, s.options.length - 2)) }))} disabled={(questionForm.options || []).length <= 2}>حذف</AdminActionButton>
                                  </div>
                                ))}
                                <AdminActionButton type="button" onClick={() => setQuestionForm((s) => ({ ...s, options: [...s.options, ""] }))} disabled={(questionForm.options || []).length >= 6}>
                                  إضافة خيار
                                </AdminActionButton>
                              </div>
                            ) : null}
                            {questionForm.type === "TRUE_FALSE" ? (
                              <AdminFormField label="الإجابة الصحيحة">
                                <AdminSelect value={questionForm.trueFalseAnswer ? "1" : "0"} onChange={(e) => setQuestionForm((s) => ({ ...s, trueFalseAnswer: e.target.value === "1" }))}>
                                  <option value="1">صح</option>
                                  <option value="0">خطأ</option>
                                </AdminSelect>
                              </AdminFormField>
                            ) : null}
                            {questionError ? <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{questionError}</p> : null}
                            <div className="flex flex-wrap gap-2">
                              <AdminActionButton type="submit" tone="primary" disabled={questionSaving}>{questionSaving ? "..." : editingQuestionId ? "تحديث السؤال" : "إضافة سؤال"}</AdminActionButton>
                              {editingQuestionId ? <AdminActionButton type="button" onClick={resetQuestionForm}>إلغاء</AdminActionButton> : null}
                            </div>
                          </form>

                          {questionsLoading ? <p className="text-xs text-slate-500">جاري تحميل الأسئلة...</p> : null}
                          {!questionsLoading && !questions.length ? <p className="text-xs text-slate-500">لا توجد أسئلة بعد.</p> : null}
                          {!questionsLoading && questions.length ? (
                            <div className="space-y-2">
                              {questions.map((q) => (
                                <div key={q.id} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
                                  <p className="font-semibold text-slate-900">{q.order}. {q.questionText}</p>
                                  <p className="mt-1 text-xs text-slate-500">{q.type} - {q.points} نقطة</p>
                                  <div className="mt-2 flex flex-wrap gap-2">
                                    <AdminActionButton onClick={() => openQuestionEdit(q)}>تعديل</AdminActionButton>
                                    <AdminActionButton onClick={() => deleteQuestion(q.id)} tone="danger">حذف</AdminActionButton>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : null}

                          <div className="rounded-xl border border-slate-200 bg-white p-3">
                            <p className="text-sm font-extrabold text-slate-900">عرض الإجابات</p>
                            {submissionsLoading ? <p className="mt-2 text-xs text-slate-500">جاري تحميل الإجابات...</p> : null}
                            {!submissionsLoading && !submissions.length ? <p className="mt-2 text-xs text-slate-500">لا توجد إجابات طلاب بعد.</p> : null}
                            {!submissionsLoading && submissions.length ? (
                              <div className="mt-2 space-y-2">
                                {submissions.map((sub) => (
                                  <div key={sub.id} className="rounded-lg border border-slate-200 bg-slate-50/50 p-2 text-xs">
                                    <p className="font-bold text-slate-900">{sub.student?.fullName || sub.student?.email}</p>
                                    <p className="text-slate-500">آخر رسالة: {sub.submittedAt ? new Date(sub.submittedAt).toLocaleString("ar-DZ") : "-"}</p>
                                    <p className="text-slate-700">النتيجة: {sub.score}/{sub.maxScore} - {sub.status}</p>
                                    <div className="mt-2 space-y-2">
                                      {(sub.answers || []).map((ans) => (
                                        <div key={ans.id} className="rounded border border-slate-200 bg-white p-2">
                                          <p className="font-semibold text-slate-800">{ans.question?.questionText}</p>
                                          <p className="mt-1 text-slate-500">الإجابة: {typeof ans.answer === "object" ? JSON.stringify(ans.answer) : String(ans.answer || "-")}</p>
                                          {ans.question?.type === "WRITTEN" ? (
                                            <div className="mt-1 grid gap-1 md:grid-cols-2">
                                              <AdminInput type="number" min="0" max={ans.question?.points || 0} value={ans.pointsAwarded || 0} onChange={(e) => setSubmissions((prev) => prev.map((row) => row.id === sub.id ? { ...row, answers: row.answers.map((a) => a.id === ans.id ? { ...a, pointsAwarded: Number(e.target.value) || 0 } : a) } : row))} />
                                              <AdminInput value={ans.correctionNote || ""} placeholder="ملاحظة التصحيح" onChange={(e) => setSubmissions((prev) => prev.map((row) => row.id === sub.id ? { ...row, answers: row.answers.map((a) => a.id === ans.id ? { ...a, correctionNote: e.target.value } : a) } : row))} />
                                            </div>
                                          ) : null}
                                        </div>
                                      ))}
                                    </div>
                                    <div className="mt-2 flex items-center gap-2">
                                      <span className="text-slate-600">تعديل النتيجة:</span>
                                      <AdminInput type="number" min="0" value={sub.score || 0} onChange={(e) => setSubmissions((prev) => prev.map((row) => row.id === sub.id ? { ...row, score: Number(e.target.value) || 0 } : row))} className="max-w-[120px]" />
                                      <AdminActionButton onClick={() => saveSubmissionCorrection(sub)} tone="primary">حفظ التصحيح</AdminActionButton>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        </>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </>
            )}
          </div>
        </div>
      ) : null}
    </AdminShell>
  );
}
