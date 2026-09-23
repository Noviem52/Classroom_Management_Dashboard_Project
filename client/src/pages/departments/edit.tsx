import { useEffect, useState } from "react";
import { useOne, useUpdate } from "@refinedev/core";
import { useNavigate, useParams, Link } from "react-router";

type Department = { id: number; code: string; name: string; description: string | null };

export const DepartmentEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { result, query } = useOne<Department>({ resource: "departments", id: id! });
  const { mutate: updateDepartment } = useUpdate();

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (result) {
      setCode(result.code);
      setName(result.name);
      setDescription(result.description ?? "");
    }
  }, [result]);

  const inputClass =
    "w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring";
  const labelClass = "block text-sm font-medium text-foreground mb-1";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!code || !name) {
      setError("Code and name are required.");
      return;
    }
    setSaving(true);
    updateDepartment(
      { resource: "departments", id: id!, values: { code, name, description } },
      {
        onSuccess: () => navigate("/departments"),
        onError: (err: any) => {
          setSaving(false);
          setError(err?.message ?? "Failed to update department.");
        },
      }
    );
  };

  if (query.isLoading) return <div className="p-6 text-muted-foreground">Loading...</div>;

  return (
    <div className="p-6 max-w-xl mx-auto">
      <Link to="/departments" className="text-sm text-primary hover:underline mb-4 inline-block">
        ← Back to Departments
      </Link>
      <div className="bg-card border border-border rounded-lg p-6">
        <h1 className="text-2xl font-bold text-foreground mb-6">Edit Department</h1>
        {error && <div className="bg-destructive/10 text-destructive text-sm rounded-md px-3 py-2 mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>Code</label>
            <input value={code} onChange={(e) => setCode(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className={inputClass} rows={3} />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-primary text-primary-foreground rounded-md py-2 text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
};