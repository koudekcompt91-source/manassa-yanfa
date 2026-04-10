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
