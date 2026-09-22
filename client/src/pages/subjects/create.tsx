import { useState } from "react";
import { useCreate, useSelect } from "@refinedev/core";
import { useNavigate, Link } from "react-router";

export const SubjectCreate = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { mutate: createSubject } = useCreate();

  const { options: departmentOptions, query: departmentQuery } = useSelect({
    resource: "departments",
    optionLabel: "name",
    optionValue: "id",
  });

  const inputClass =
    "w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring";
  const labelClass = "block text-sm font-medium text-foreground mb-1";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!code || !name || !departmentId) {
      setError("Code, name, and department are required.");
      return;
    }
    setSaving(true);
    createSubject(
      {
        resource: "subjects",
        values: { code, name, description, department_id: Number(departmentId) },
      },
      {
        onSuccess: () => {
          setSaving(false);
          navigate("/subjects");
        },
        onError: (err: any) => {
          setSaving(false);
          setError(err?.message ?? "Failed to create subject.");
        },
      }
    );
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <Link to="/subjects" className="text-sm text-primary hover:underline mb-4 inline-block">
        ← Back to Subjects
      </Link>
      <div className="bg-card border border-border rounded-lg p-6">
        <h1 className="text-2xl font-bold text-foreground mb-1">Create Subject</h1>
        <p className="text-sm text-muted-foreground mb-6">Add a new subject under a department.</p>

        {error && (
          <div className="bg-destructive/10 text-destructive text-sm rounded-md px-3 py-2 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>Code</label>
            <input value={code} onChange={(e) => setCode(e.target.value)} className={inputClass} placeholder="e.g. CS101" />
          </div>
          <div>
            <label className={labelClass}>Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="e.g. Intro to Programming" />
          </div>
          <div>
            <label className={labelClass}>Department</label>
            <select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} className={inputClass}>
              <option value="">-- Select a department --</option>
              {departmentQuery.isLoading && <option>Loading...</option>}
              {(departmentOptions ?? []).map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
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
            {saving ? "Creating..." : "Create Subject"}
          </button>
        </form>
      </div>
    </div>
  );
};