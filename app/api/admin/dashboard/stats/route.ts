import { NextResponse } from "next/server";
import { requireAdminApiSession } from "@/lib/auth/api-guards";
import { prisma } from "@/lib/prisma";
import { getCourseProgressForStudent } from "@/lib/progress";

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfToday() {
  const d = startOfToday();
  d.setDate(d.getDate() + 1);
  return d;
}

export async function GET() {
  const guard = await requireAdminApiSession();
  if (!guard.ok) return guard.response;

  try {
    const now = new Date();
    const todayStart = startOfToday();
    const todayEnd = endOfToday();

    const [
      studentsTotal,
      coursesTotal,
      publishedCourses,
      paidCourses,
      freeCourses,
      lessonsTotal,
      liveSessionsTotal,
      upcomingLiveSessions,
      assessmentsTotal,
      submissionsTotal,
      certificatesTotal,
      activeCertificates,
      chatConversationsTotal,
      unreadStudentMessages,
      notificationsTotal,
      rechargeRequestsTotal,
      pendingRechargeRequests,
      pendingAssessmentCorrections,
      draftCoursesCount,
      unpublishedLessonsCount,
      enrollments,
      revenueAgg,
      recentStudents,
      recentEnrollments,
      recentChatMessages,
      recentSubmissions,
      recentCertificates,
      recentLiveSessions,
      recentRechargeRequests,
      allCoursesLite,
      lessonCountsByCourse,
      assessmentCountsByCourse,
      certificateCountsByCourse,
      enrollmentStatsByCourse,
      openNoAdminReplyConversations,
      liveTodayCount,
    ] = await Promise.all([
      prisma.user.count({ where: { role: "STUDENT" } }),
      prisma.course.count(),
      prisma.course.count({ where: { status: "PUBLISHED" } }),
      prisma.course.count({ where: { accessType: "PAID" } }),
      prisma.course.count({ where: { accessType: "FREE" } }),
      prisma.lesson.count(),
      prisma.liveSession.count(),
      prisma.liveSession.count({
        where: {
          startsAt: { gte: now },
          isPublished: true,
          status: { in: ["SCHEDULED", "LIVE"] },
        },
      }),
      prisma.assessment.count(),
      prisma.assessmentSubmission.count(),
      prisma.certificate.count(),
      prisma.certificate.count({ where: { status: "ACTIVE" } }),
      prisma.chatConversation.count(),
      prisma.chatMessage.count({
        where: { isRead: false, sender: { role: "STUDENT" } },
      }),
      prisma.notification.count(),
      prisma.rechargeRequest.count(),
      prisma.rechargeRequest.count({ where: { status: "pending" } }),
      prisma.assessmentSubmission.count({ where: { status: "PENDING_CORRECTION" } }),
      prisma.course.count({ where: { status: "DRAFT" } }),
      prisma.lesson.count({ where: { isPublished: false } }),
      prisma.enrollment.findMany({
        select: { userId: true, packageId: true, paidMad: true, enrolledAt: true },
      }),
      prisma.enrollment.aggregate({ _sum: { paidMad: true } }),
      prisma.user.findMany({
        where: { role: "STUDENT" },
        select: { fullName: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.enrollment.findMany({
        select: {
          enrolledAt: true,
          user: { select: { fullName: true } },
          packageId: true,
        },
        orderBy: { enrolledAt: "desc" },
        take: 5,
      }),
      prisma.chatMessage.findMany({
        select: {
          createdAt: true,
          sender: { select: { fullName: true } },
          conversation: { select: { course: { select: { title: true } } } },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.assessmentSubmission.findMany({
        select: {
          submittedAt: true,
          createdAt: true,
          student: { select: { fullName: true } },
          assessment: { select: { course: { select: { title: true } } } },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.certificate.findMany({
        select: {
          issuedAt: true,
          student: { select: { fullName: true } },
          course: { select: { title: true } },
        },
        orderBy: { issuedAt: "desc" },
        take: 5,
      }),
      prisma.liveSession.findMany({
        select: {
          title: true,
          createdAt: true,
          course: { select: { title: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.rechargeRequest.findMany({
        select: {
          createdAt: true,
          firstName: true,
          lastName: true,
          amount: true,
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.course.findMany({
        select: { id: true, title: true },
      }),
      prisma.lesson.groupBy({
        by: ["courseId"],
        _count: { _all: true },
      }),
      prisma.assessment.groupBy({
        by: ["courseId"],
        _count: { _all: true },
      }),
      prisma.certificate.groupBy({
        by: ["courseId"],
        _count: { _all: true },
      }),
      prisma.enrollment.groupBy({
        by: ["packageId"],
        _count: { _all: true },
        _sum: { paidMad: true },
      }),
      prisma.chatConversation.count({
        where: {
          status: "OPEN",
          messages: { none: { sender: { role: "ADMIN" } } },
        },
      }),
      prisma.liveSession.count({
        where: {
          startsAt: { gte: todayStart, lt: todayEnd },
          status: { in: ["SCHEDULED", "LIVE"] },
        },
      }),
    ]);

    const courseTitleById = new Map(allCoursesLite.map((c) => [c.id, c.title]));
    const recentActivities = [
      ...recentStudents.map((row) => ({
        type: "student_registered",
        title: "تسجيل طالب جديد",
        studentName: row.fullName || "طالب",
        courseTitle: "",
        timestamp: row.createdAt,
      })),
      ...recentEnrollments.map((row) => ({
        type: "enrollment",
        title: "اشتراك جديد في دورة",
        studentName: row.user?.fullName || "طالب",
        courseTitle: courseTitleById.get(row.packageId) || "دورة",
        timestamp: row.enrolledAt,
      })),
      ...recentChatMessages.map((row) => ({
        type: "chat_message",
        title: "رسالة جديدة في المحادثة",
        studentName: row.sender?.fullName || "طالب",
        courseTitle: row.conversation?.course?.title || "",
        timestamp: row.createdAt,
      })),
      ...recentSubmissions.map((row) => ({
        type: "assessment_submission",
        title: "إجابة جديدة على اختبار/واجب",
        studentName: row.student?.fullName || "طالب",
        courseTitle: row.assessment?.course?.title || "",
        timestamp: row.submittedAt || row.createdAt,
      })),
      ...recentCertificates.map((row) => ({
        type: "certificate_issued",
        title: "إصدار شهادة جديدة",
        studentName: row.student?.fullName || "طالب",
        courseTitle: row.course?.title || "",
        timestamp: row.issuedAt,
      })),
      ...recentLiveSessions.map((row) => ({
        type: "live_session_created",
        title: `إضافة حصة مباشرة: ${row.title || "بدون عنوان"}`,
        studentName: "",
        courseTitle: row.course?.title || "",
        timestamp: row.createdAt,
      })),
      ...recentRechargeRequests.map((row) => ({
        type: "recharge_request",
        title: `طلب شحن جديد (${Number(row.amount || 0)} دج)`,
        studentName: `${row.firstName || ""} ${row.lastName || ""}`.trim() || "طالب",
        courseTitle: "",
        timestamp: row.createdAt,
      })),
    ]
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 20)
      .map((row) => ({
        ...row,
        timestamp: row.timestamp.toISOString(),
      }));

    const lessonCountMap = new Map(lessonCountsByCourse.map((r) => [r.courseId, r._count._all]));
    const assessmentCountMap = new Map(assessmentCountsByCourse.map((r) => [r.courseId, r._count._all]));
    const certificateCountMap = new Map(certificateCountsByCourse.map((r) => [r.courseId, r._count._all]));
    const enrollmentStatsMap = new Map(
      enrollmentStatsByCourse.map((r) => [r.packageId, { enrolled: r._count._all, revenue: Number(r._sum.paidMad || 0) }])
    );

    const topCoursesBase = allCoursesLite
      .map((course) => {
        const enrollment = enrollmentStatsMap.get(course.id) || { enrolled: 0, revenue: 0 };
        return {
          courseId: course.id,
          courseTitle: course.title,
          enrolledStudents: enrollment.enrolled,
          lessonsCount: lessonCountMap.get(course.id) || 0,
          assessmentsCount: assessmentCountMap.get(course.id) || 0,
          certificatesIssued: certificateCountMap.get(course.id) || 0,
          revenue: enrollment.revenue,
        };
      })
      .sort((a, b) => b.enrolledStudents - a.enrolledStudents)
      .slice(0, 8);

    const progressByCourse = await Promise.all(
      topCoursesBase.map(async (course) => {
        const targetEnrollments = enrollments.filter((e) => e.packageId === course.courseId).slice(0, 25);
        if (!targetEnrollments.length) return { ...course, averageProgress: 0 };
        const progressRows = await Promise.all(
          targetEnrollments.map((e) => getCourseProgressForStudent(course.courseId, e.userId))
        );
        const avg = Math.round(
          progressRows.reduce((acc, row) => acc + (Number(row.progressPercent) || 0), 0) / progressRows.length
        );
        return { ...course, averageProgress: avg };
      })
    );

    const completedPairSet = new Set(
      (
        await prisma.certificate.findMany({
          select: { studentId: true, courseId: true },
        })
      ).map((c) => `${c.studentId}__${c.courseId}`)
    );

    const startedPairSet = new Set(
      (
        await prisma.lessonProgress.findMany({
          select: { studentId: true, courseId: true },
          distinct: ["studentId", "courseId"],
        })
      ).map((p) => `${p.studentId}__${p.courseId}`)
    );

    const submissionPairs = await prisma.assessmentSubmission.findMany({
      select: { studentId: true, assessmentId: true },
      distinct: ["studentId", "assessmentId"],
    });
    const assessmentIds = submissionPairs.map((row) => row.assessmentId);
    const assessments = assessmentIds.length
      ? await prisma.assessment.findMany({
          where: { id: { in: assessmentIds } },
          select: { id: true, courseId: true },
        })
      : [];
    const courseByAssessmentId = new Map(assessments.map((a) => [a.id, a.courseId]));
    for (const row of submissionPairs) {
      const courseId = courseByAssessmentId.get(row.assessmentId);
      if (courseId) startedPairSet.add(`${row.studentId}__${courseId}`);
    }

    let studentsNotStarted = 0;
    let studentsCompletedCourses = 0;
    let studentsInProgress = 0;
    for (const enrollment of enrollments) {
      const key = `${enrollment.userId}__${enrollment.packageId}`;
      if (completedPairSet.has(key)) {
        studentsCompletedCourses += 1;
      } else if (startedPairSet.has(key)) {
        studentsInProgress += 1;
      } else {
        studentsNotStarted += 1;
      }
    }

    const latestCompletedCourses = await prisma.certificate.findMany({
      include: {
        student: { select: { fullName: true } },
        course: { select: { title: true } },
      },
      orderBy: { issuedAt: "desc" },
      take: 8,
    });

    return NextResponse.json({
      ok: true,
      stats: {
        totalStudents: studentsTotal,
        totalCourses: coursesTotal,
        publishedCourses,
        paidCourses,
        freeCourses,
        totalLessons: lessonsTotal,
        totalLiveSessions: liveSessionsTotal,
        upcomingLiveSessions,
        totalAssessments: assessmentsTotal,
        totalSubmissions: submissionsTotal,
        totalCertificates: certificatesTotal,
        activeCertificates,
        totalChatConversations: chatConversationsTotal,
        unreadStudentMessages,
        totalNotificationsSent: notificationsTotal,
        totalRechargeRequests: rechargeRequestsTotal,
        totalRevenue: Number(revenueAgg._sum.paidMad || 0),
      },
      recentActivities,
      coursePerformance: progressByCourse,
      studentProgressOverview: {
        studentsNotStarted,
        studentsInProgress,
        studentsCompletedCourses,
        latestCompletedCourses: latestCompletedCourses.map((row) => ({
          studentName: row.student.fullName || "طالب",
          courseTitle: row.course.title || "دورة",
          issuedAt: row.issuedAt.toISOString(),
        })),
      },
      alerts: {
        unansweredChatConversations: openNoAdminReplyConversations,
        upcomingLiveSessionsToday: liveTodayCount,
        pendingAssessmentCorrections,
        pendingRechargeRequests,
        draftCourses: draftCoursesCount,
        unpublishedLessons: unpublishedLessonsCount,
      },
    });
  } catch (e) {
    console.error("[admin/dashboard/stats][GET] error:", e);
    return NextResponse.json({ ok: false, message: "تعذّر تحميل إحصائيات لوحة الإدارة." }, { status: 500 });
  }
}
