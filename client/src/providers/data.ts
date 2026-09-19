import type { DataProvider } from "@refinedev/core";

const API_URL = import.meta.env.VITE_BACKEND_BASE_URL;

const authHeaders = (): Record<string, string> => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const dataProvider: DataProvider = {
  getList: async ({ resource, pagination, filters }) => {
    const page = pagination?.currentPage ?? 1;
    const limit = pagination?.pageSize ?? 10;
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });

    filters?.forEach((f: any) => {
      if (f.field && f.value) params.append(f.field, f.value);
    });

    const res = await fetch(`${API_URL}/${resource}?${params}`, { headers: authHeaders() });
    if (!res.ok) throw new Error(`Failed to fetch ${resource}`);
    const json = await res.json();
    return { data: json.data, total: json.pagination.total };
  },

  getOne: async ({ resource, id }) => {
    const res = await fetch(`${API_URL}/${resource}/${id}`, { headers: authHeaders() });
    if (!res.ok) throw new Error(`Failed to fetch ${resource}/${id}`);
    const json = await res.json();
    return { data: json.data };
  },

  create: async ({ resource, variables }) => {
    const res = await fetch(`${API_URL}/${resource}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(variables),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.detail || `Failed to create ${resource}`);
    }
    const json = await res.json();
    return { data: json.data };
  },

  update: async ({ resource, id, variables }) => {
    const res = await fetch(`${API_URL}/${resource}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(variables),
    });
    if (!res.ok) throw new Error(`Failed to update ${resource}/${id}`);
    const json = await res.json();
    return { data: json.data };
  },

  deleteOne: async ({ resource, id }) => {
    const res = await fetch(`${API_URL}/${resource}/${id}`, { method: "DELETE", headers: authHeaders() });
    if (!res.ok) throw new Error(`Failed to delete ${resource}/${id}`);
    return { data: { id } as any };
  },

  getApiUrl: () => API_URL,
};