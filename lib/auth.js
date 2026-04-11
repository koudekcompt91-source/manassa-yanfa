import { API_BASE_URL, formatApiErrorMessage } from "./api";

export const authStore = {
  getToken() {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
  },
  getUser() {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  },
  saveAuth(token, user) {
    if (token) localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
  },
  saveUser(user) {
    localStorage.setItem("user", JSON.stringify(user));
  },
  clearAuth() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
};

/**
 * POST JSON to /auth/login — never uses GET or query strings.
 */
export async function loginUser(email, password) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });
  } catch {
    throw new Error(
      "تعذّر الاتصال بالخادم. تأكد أن الواجهة الخلفية تعمل وأن الرابط في .env.local صحيح."
    );
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(formatApiErrorMessage(data, response.status));
  }

  return data;
}

export async function registerUser(fullName, email, password) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fullName, email, password }),
    });
  } catch {
    throw new Error(
      "تعذّر الاتصال بالخادم. تأكد أن الواجهة الخلفية تعمل وأن الرابط في .env.local صحيح."
    );
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(formatApiErrorMessage(data, response.status));
  }

  return data;
}
