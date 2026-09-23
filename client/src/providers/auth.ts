import type { AuthProvider } from "@refinedev/core";

const API_URL = import.meta.env.VITE_BACKEND_BASE_URL;

export const authProvider: AuthProvider = {
  login: async ({ email, password }) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return {
        success: false,
        error: {
          name: "Login failed",
          message: body?.detail ?? "Invalid email or password",
        },
      };
    }
    const { data } = await res.json();
    localStorage.setItem("token", data.access_token);
    localStorage.setItem("user", JSON.stringify(data.user));
    return { success: true, redirectTo: "/" };
  },

  register: async ({ name, email, password, role }: any) => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const message =
        typeof body?.detail === "string" ? body.detail : "Registration failed";
      return {
        success: false,
        error: { name: "Registration failed", message },
      };
    }
    const { data } = await res.json();
    localStorage.setItem("token", data.access_token);
    localStorage.setItem("user", JSON.stringify(data.user));
    return { success: true, redirectTo: "/" };
  },

  logout: async () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return { success: true, redirectTo: "/login" };
  },

  check: async () => {
    const token = localStorage.getItem("token");
    if (!token) return { authenticated: false, redirectTo: "/login" };
    return { authenticated: true };
  },

  getIdentity: async () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  getPermissions: async () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user).role : null;
  },

  onError: async (error) => {
    if (error?.statusCode === 401)
      return { logout: true, redirectTo: "/login" };
    return { error };
  },
};
