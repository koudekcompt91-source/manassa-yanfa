/** Client-side lesson completion + light gamification (localStorage). Does not replace server enrollments. */

const KEY_PROGRESS = "yanfa_pkg_progress_v1";
const KEY_ENGAGEMENT = "yanfa_engagement_v1";

function safeParse(json, fallback) {
  try {
    const v = JSON.parse(json);
    return v && typeof v === "object" ? v : fallback;
  } catch {
    return fallback;
  }
}

export function readPackageProgress() {
  if (typeof window === "undefined") return {};
  return safeParse(localStorage.getItem(KEY_PROGRESS) || "{}", {});
}

export function writePackageProgress(next) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY_PROGRESS, JSON.stringify(next));
  notifyStudentStorage();
}

/** Same-tab listeners (storage event only fires across tabs). */
export function notifyStudentStorage() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("yanfa-student-storage"));
}

export function getCompletedSet(packageId) {
  const all = readPackageProgress();
  const ids = all[packageId]?.completedLessonIds;
  return new Set(Array.isArray(ids) ? ids : []);
}

/**
 * @param {string} packageId
 * @param {string[]} publishedLessonIdsInOrder
 */
export function getPackageProgressStats(packageId, publishedLessonIdsInOrder) {
  const completed = getCompletedSet(packageId);
  const ids = publishedLessonIdsInOrder || [];
  const total = ids.length;
  const done = ids.filter((id) => completed.has(id)).length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  return { done, total, pct };
}

/**
 * @returns {boolean} true if newly completed
 */
export function markLessonComplete(packageId, lessonId) {
  if (!packageId || !lessonId) return false;
  const all = readPackageProgress();
  const cur = all[packageId] || { completedLessonIds: [] };
  const set = new Set(cur.completedLessonIds);
  if (set.has(lessonId)) return false;
  set.add(lessonId);
  all[packageId] = { ...cur, completedLessonIds: [...set] };
  writePackageProgress(all);
  return true;
}

export function readEngagement() {
  if (typeof window === "undefined") {
    return { points: 0, streak: 0, lastLogin: null, badges: [] };
  }
  const d = safeParse(localStorage.getItem(KEY_ENGAGEMENT) || "{}", {});
  return {
    points: Number(d.points) || 0,
    streak: Number(d.streak) || 0,
    lastLogin: d.lastLogin || null,
    badges: Array.isArray(d.badges) ? d.badges : [],
  };
}

function writeEngagement(next) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY_ENGAGEMENT, JSON.stringify(next));
  notifyStudentStorage();
}

/** Call when student session loads; awards small daily bonus once per calendar day. */
export function recordDailyLogin() {
  const today = new Date().toISOString().slice(0, 10);
  const e = readEngagement();
  if (e.lastLogin === today) return e;

  let streak = e.streak || 0;
  if (e.lastLogin) {
    const prev = new Date(`${e.lastLogin}T12:00:00`);
    const cur = new Date(`${today}T12:00:00`);
    const diffDays = Math.round((cur - prev) / 86400000);
    if (diffDays === 1) streak += 1;
    else if (diffDays > 1) streak = 1;
    else streak = streak || 1;
  } else {
    streak = 1;
  }

  const points = (e.points || 0) + 5;
  const badges = [...(e.badges || [])];
  if (streak >= 3 && !badges.includes("streak-3")) badges.push("streak-3");
  if (streak >= 7 && !badges.includes("streak-7")) badges.push("streak-7");

  const next = { points, streak, lastLogin: today, badges };
  writeEngagement(next);
  return next;
}

export function addPointsForLessonComplete() {
  const e = readEngagement();
  let points = (e.points || 0) + 15;
  const badges = [...(e.badges || [])];
  if (points >= 50 && !badges.includes("points-50")) badges.push("points-50");
  if (points >= 150 && !badges.includes("points-150")) badges.push("points-150");
  writeEngagement({ ...e, points, badges });
  return readEngagement();
}
