# DELIVERY CHECKLIST

## Project Overview

Yanfa / yanfa3 Education / منصة ينفع is a Next.js (App Router) Arabic RTL educational platform with:
- Student and admin authentication (separate portals/sessions)
- Course catalog and protected paid course access
- Lessons with YouTube playback
- Live Zoom sessions
- Student/admin notifications (including in-app toast)
- Course chat
- Assignments and quizzes
- Progress tracking and certificates
- Wallet/recharge/purchase flow
- Admin content management and dashboards

## Main Features (Ready)

- Public pages and student acquisition flow
- Student register/login/logout and dashboard
- Admin login and admin dashboard
- Course CRUD and lesson/live-session management
- Notifications and unread handling
- Course chat (student/admin)
- Assessments/submissions/corrections
- Progress analytics and certificate issuance/verification
- Wallet recharge request and purchase flow
- Light premium auth UI (login/register) with no demo credentials shown

## Admin Test Checklist

- [ ] Login via `/admin/login`
- [ ] Open `/admin/dashboard`
- [ ] Create/update/delete course
- [ ] Create lesson with valid YouTube URL
- [ ] Create live Zoom session and verify publish state
- [ ] Send notification to students
- [ ] Open student chat conversations and reply
- [ ] Create quiz/assignment and questions
- [ ] Review submissions and correction flow
- [ ] Review recharge requests and approve/reject
- [ ] Confirm content management pages load and save updates
- [ ] Logout from admin

## Student Test Checklist

- [ ] Register via `/register` (all fields empty by default)
- [ ] Login via `/login`
- [ ] Confirm redirect to `/dashboard`
- [ ] Open enrolled course lessons
- [ ] Verify paid protection on non-enrolled paid course
- [ ] Open live sessions tab and confirm join link visibility rules
- [ ] Send and receive chat messages in a subscribed course
- [ ] Open assessments, submit answers, and review result state
- [ ] Verify progress updates after lesson completion and submission
- [ ] Verify certificate appears only after completion
- [ ] Submit wallet recharge request
- [ ] Purchase paid course after approval
- [ ] Logout from student

## Deployment Checklist (Railway)

- [ ] `npm install` completes on Railway build image
- [ ] `npx prisma generate` runs in build phase
- [ ] `npm run build` passes
- [ ] `npx prisma migrate deploy` runs during deploy/release
- [ ] Environment variables configured (see below)
- [ ] `AUTH_SECRET` is strong (32+ chars) in production
- [ ] Confirm cookies are secure in production (`secure: true` by NODE_ENV)
- [ ] Validate admin/student login after deploy
- [ ] Validate protected routes and APIs after deploy

## Required Environment Variables

- `DATABASE_URL` (PostgreSQL connection string)
- `AUTH_SECRET` (JWT/session signing secret, 32+ chars)

Optional / maintenance:
- `ADMIN_RESET_TOKEN` (used by dev-only admin reset endpoint)

## Railway Notes

- Use Railway Postgres and set `DATABASE_URL` in service variables.
- Ensure deploy command includes Prisma migration apply step (`prisma migrate deploy`).
- Build output currently shows a Prisma deprecation notice about `package.json#prisma`; this is non-blocking but should be migrated later to `prisma.config.ts`.

## Security & QA Findings Summary

- Student/admin auth separation is enforced in middleware and API guards.
- Protected student APIs use session-bound filtering (`session.sub`) for private resources.
- Paid course protections exist server-side:
  - Paid lesson video URLs are masked for non-enrolled users.
  - Zoom links are withheld for non-enrolled users.
  - Chat/assessments/certificate endpoints require both student session and course access checks.
- Login/register pages no longer show demo credentials in UI.
- `.env` is gitignored.
- User-facing API errors are generally sanitized (generic Arabic messages).

## Known Limitations

- Full end-to-end flow verification (payments, enrollment, chat round-trip, cert issuance) still needs manual testing against real seeded data and roles.
- Some development utilities still reference seed emails in non-UI code (seed/reset scripts), which is acceptable for maintenance but should not be exposed in production UI.
- Prisma deprecation warning (`package.json#prisma`) is pending cleanup.

## Recommended Next Improvements

- Add automated E2E tests (Playwright) for:
  - student login/register
  - admin login
  - paid access gating
  - assessment submission
  - wallet purchase flow
- Add security integration tests for cross-user access attempts.
- Migrate Prisma config from `package.json` to `prisma.config.ts`.
- Add CI checklist that enforces `npm run build` and route/API smoke tests on PRs.
