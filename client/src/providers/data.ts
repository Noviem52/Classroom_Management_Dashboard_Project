import type { DataProvider, HttpError } from "@refinedev/core";

const API_URL = import.meta.env.VITE_BACKEND_BASE_URL;

const authHeaders = (): Record<string, string> => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// FastAPI returns `detail` as a string (HTTPException) or an array (422 validation errors)
const parseDetail = (detail: unknown): string | undefined => {
  if (!detail) return undefined;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((d: any) => {
        const field = Array.isArray(d?.loc) ? d.loc.slice(1).join(".") : "";
        return field ? `${field}: ${d?.msg}` : d?.msg;
      })
      .join("; ");
  }
  return JSON.stringify(detail);
};

async function request(url: string, init: RequestInit = {}): Promise<any> {
  let res: Response;
  try {
    res = await fetch(url, {
      ...init,
      headers: {
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...authHeaders(),
        ...((init.headers as Record<string, string>) ?? {}),
      },
    });
  } catch {
    const error: HttpError = {
      message:
        "Cannot reach the server, or the server crashed. Check the backend terminal for a traceback.",
      statusCode: 0,
    };
    throw error;
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const error: HttpError = {
      message: parseDetail(body?.detail) ?? `Request failed (${res.status})`,
      statusCode: res.status,
    };
    throw error;
  }

  if (res.status === 204) return null;
  return res.json();
}

export const dataProvider: DataProvider = {
  getList: async ({ resource, pagination, filters }) => {
    const page = pagination?.currentPage ?? 1;
    // useSelect uses pagination mode "off": fetch everything for dropdowns
    const limit = pagination?.mode === "off" ? 1000 : pagination?.pageSize ?? 10;
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });

    filters?.forEach((f: any) => {
      if (f.field && f.value !== undefined && f.value !== null && f.value !== "") {
        params.append(f.field, String(f.value));
      }
    });

    const json = await request(`${API_URL}/${resource}?${params}`);
    return { data: json.data, total: json.pagination.total };
  },

  getOne: async ({ resource, id }) => {
    const json = await request(`${API_URL}/${resource}/${id}`);
    return { data: json.data };
  },

  create: async ({ resource, variables }) => {
    const json = await request(`${API_URL}/${resource}`, {
      method: "POST",
      body: JSON.stringify(variables),
    });
    return { data: json.data };
  },

  update: async ({ resource, id, variables }) => {
    const json = await request(`${API_URL}/${resource}/${id}`, {
      method: "PATCH",
      body: JSON.stringify(variables),
    });
    return { data: json.data };
  },

  deleteOne: async ({ resource, id }) => {
    await request(`${API_URL}/${resource}/${id}`, { method: "DELETE" });
    return { data: { id } as any };
  },

  getApiUrl: () => API_URL,
};