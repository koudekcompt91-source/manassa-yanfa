# منصة ينفع Frontend

Next.js + Tailwind CSS frontend for the educational platform.

## Included Pages

- Landing page (`/`)
- Login (`/login`)
- Register (`/register`)
- Dashboard (`/dashboard`)
- Courses (`/courses`)
- Lesson page with video (`/courses/[id]/lesson/[lessonId]`)

## Run

1. Install dependencies:

```bash
npm install
```

2. Create local environment:

```bash
cp .env.local.example .env.local
```

3. Start dev server:

```bash
npm run dev
```

If you see broken Next.js chunks (e.g. `Cannot find module './460.js'`), clear the build cache and restart:

```bash
npm run clean
npm run dev
```

Or in one step: `npm run dev:fresh`

Set the backend API URL in `.env.local` (no trailing slash). The frontend calls:

- **Login:** `POST {NEXT_PUBLIC_API_BASE_URL}/auth/login` with JSON `{ "email", "password" }`.
- **Register:** `POST {NEXT_PUBLIC_API_BASE_URL}/auth/register` with JSON `{ "fullName", "email", "password", "role" }`.

Example when the API is served at `http://localhost:5000/api/v1`:

`NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api/v1`

On **macOS**, port `5000` is often used by **AirPlay Receiver**, so the browser may not reach your backend. Prefer another port for the API or turn off AirPlay Receiver (System Settings → General → AirDrop & Handoff).
