import { useState } from "react";
import { useCreate } from "@refinedev/core";
import { useNavigate, Link } from "react-router";

export const JoinClass = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { mutate: enroll } = useCreate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!code.trim()) {
      setError("Please enter an invite code.");
      return;
    }
    setSaving(true);
    enroll(
      { resource: "enrollments", values: { invite_code: code.trim().toUpperCase() } },
      {
        onSuccess: () => {
          setSaving(false);
          navigate("/my-classes");
        },
        onError: (err: any) => {
          setSaving(false);
          setError(err?.message ?? "Could not join the class.");
        },
      }
    );
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <Link to="/my-classes" className="text-sm text-primary hover:underline mb-4 inline-block">
        ← Back to My Classes
      </Link>
      <div className="bg-card border border-border rounded-lg p-6">
        <h1 className="text-2xl font-bold text-foreground mb-1">Join a Class</h1>
        <p className="text-sm text-muted-foreground mb-6">Enter the invite code your teacher gave you.</p>

        {error && (
          <div className="bg-destructive/10 text-destructive text-sm rounded-md px-3 py-2 mb-4">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="e.g. A7F3K9QZ"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-primary text-primary-foreground rounded-md py-2 text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
          >
            {saving ? "Joining..." : "Join Class"}
          </button>
        </form>
      </div>
    </div>
  );
};