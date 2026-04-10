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

Set the backend API URL in `.env.local`:
`NEXT_PUBLIC_API_BASE_URL=http://localhost:your-backend-port/api/v1`

Example when backend runs on port `5000`:
`NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api/v1`
