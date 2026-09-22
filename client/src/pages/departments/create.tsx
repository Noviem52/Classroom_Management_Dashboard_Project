import { useState } from "react";
import { useCreate } from "@refinedev/core";
import { useNavigate, Link } from "react-router";

export const DepartmentCreate = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { mutate: createDepartment } = useCreate();

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
    createDepartment(
      { resource: "departments", values: { code, name, description } },
      {
        onSuccess: () => {
          setSaving(false);
          navigate("/departments");
        },
        onError: (err: any) => {
          setSaving(false);
          setError(err?.message ?? "Failed to create department.");
        },
      }
    );
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <Link to="/departments" className="text-sm text-primary hover:underline mb-4 inline-block">
        ← Back to Departments
      </Link>
      <div className="bg-card border border-border rounded-lg p-6">
        <h1 className="text-2xl font-bold text-foreground mb-1">Create Department</h1>
        <p className="text-sm text-muted-foreground mb-6">Add a new academic department.</p>

        {error && (
          <div className="bg-destructive/10 text-destructive text-sm rounded-md px-3 py-2 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>Code</label>
            <input value={code} onChange={(e) => setCode(e.target.value)} className={inputClass} placeholder="e.g. CS" />
          </div>
          <div>
            <label className={labelClass}>Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="e.g. Computer Science" />
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
            {saving ? "Creating..." : "Create Department"}
          </button>
        </form>
      </div>
    </div>
  );
};