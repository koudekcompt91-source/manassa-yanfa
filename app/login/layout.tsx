import type { ReactNode } from "react";

/** Keeps /login on the dynamic path so dev/prod always resolve this segment with the app shell. */
export const dynamic = "force-dynamic";

export default function LoginLayout({ children }: { children: ReactNode }) {
  return children;
}
