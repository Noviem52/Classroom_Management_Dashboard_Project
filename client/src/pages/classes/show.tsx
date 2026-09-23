import { useState } from "react";
import { useShow, useGetIdentity, useDelete } from "@refinedev/core";
import { useParams, Link, useNavigate } from "react-router";

type ClassDetail = {
  id: number;
  name: string;
  description: string | null;
  capacity: number;
  status: "active" | "archived";
  banner_url: string | null;
  invite_code: string | null;
  teacher_id: number;
  enrolled_count: number;
  subject?: { name: string; code: string };
  teacher?: { name: string; email: string };
  department?: { name: string };
};

type Identity = { id: number; name: string; role: "student" | "teacher" | "admin" };

export const ClassShow = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: identity } = useGetIdentity<Identity>();
  const { query, result } = useShow<ClassDetail>({ resource: "classes", id });
  const { mutate: deleteClass } = useDelete();
  const [copied, setCopied] = useState(false);

  if (query.isLoading) {
    return <div className="p-6 text-muted-foreground">Loading class...</div>;
  }

  if (query.isError || !result) {
    return (
      <div className="p-6">
        <Link to="/classes" className="text-sm text-primary hover:underline">← Back to Classes</Link>
        <p className="mt-4 text-destructive">Class not found or could not be loaded.</p>
      </div>
    );
  }

  const isAdmin = identity?.role === "admin";
  const canManage = isAdmin || (identity?.role === "teacher" && identity.id === result.teacher_id);
  const seatsLeft = Math.max(result.capacity - result.enrolled_count, 0);

  const copyCode = async () => {
    if (!result.invite_code) return;
    await navigator.clipboard.writeText(result.invite_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleDelete = () => {
    if (!confirm(`Delete "${result.name}"? This also removes all enrollments.`)) return;
    deleteClass(
      { resource: "classes", id: result.id },
      { onSuccess: () => navigate("/classes") }
    );
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Link to="/classes" className="text-sm text-primary hover:underline mb-4 inline-block">
        ← Back to Classes
      </Link>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {result.banner_url ? (
          <img src={result.banner_url} alt={`${result.name} banner`} className="w-full h-56 object-cover" />
        ) : (
          <div className="w-full h-32 bg-muted flex items-center justify-center text-muted-foreground text-sm">
            No banner image
          </div>
        )}

        <div className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{result.name}</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {result.subject?.code} · {result.subject?.name} · {result.department?.name}
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                result.status === "active"
                  ? "bg-secondary text-secondary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {result.status}
            </span>
          </div>

          {result.description && (
            <p className="mt-4 text-sm text-foreground whitespace-pre-line">{result.description}</p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            <div className="border border-border rounded-md p-4">
              <p className="text-xs text-muted-foreground">Teacher</p>
              <p className="font-medium">{result.teacher?.name}</p>
              <p className="text-xs text-muted-foreground">{result.teacher?.email}</p>
            </div>
            <div className="border border-border rounded-md p-4">
              <p className="text-xs text-muted-foreground">Enrolled</p>
              <p className="font-medium">
                {result.enrolled_count} / {result.capacity}
              </p>
              <p className="text-xs text-muted-foreground">{seatsLeft} seats left</p>
            </div>
            {result.invite_code && (
              <div className="border border-border rounded-md p-4">
                <p className="text-xs text-muted-foreground">Invite code</p>
                <div className="flex items-center gap-2">
                  <code className="font-mono font-semibold tracking-wider">{result.invite_code}</code>
                  <button onClick={copyCode} className="text-xs text-primary hover:underline">
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">Share with students to join</p>
              </div>
            )}
          </div>

          {canManage && (
            <div className="flex gap-3 mt-6">
              <Link
                to={`/classes/${result.id}/edit`}
                className="bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm font-medium hover:opacity-90"
              >
                Edit Class
              </Link>
              {isAdmin && (
                <button
                  onClick={handleDelete}
                  className="border border-destructive text-destructive rounded-md px-4 py-2 text-sm font-medium hover:bg-destructive/10"
                >
                  Delete Class
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};