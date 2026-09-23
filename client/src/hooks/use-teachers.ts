import { useEffect, useState } from "react";

export type TeacherOption = { value: number; label: string };

export function useTeachers() {
  const [options, setOptions] = useState<TeacherOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_BASE_URL}/users?role=teacher&limit=1000`,
          { headers: token ? { Authorization: `Bearer ${token}` } : {} }
        );
        if (!res.ok) throw new Error(`Failed to load teachers (${res.status})`);
        const json = await res.json();
        if (!cancelled) {
          setOptions((json?.data ?? []).map((u: any) => ({ value: u.id, label: u.name })));
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "Failed to load teachers");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { options, loading, error };
}