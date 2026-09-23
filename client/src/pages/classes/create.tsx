import { useState } from "react";
import { useCreate, useSelect } from "@refinedev/core";
import { useNavigate, Link } from "react-router";
import { openBannerUpload } from "../../lib/cloudinary";
import { useTeachers } from "../../hooks/use-teachers";

export const ClassCreate = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [capacity, setCapacity] = useState(30);
  const [subjectId, setSubjectId] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [bannerData, setBannerData] = useState<{ banner_url: string; banner_cld_pub_id: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { mutate: createClass } = useCreate();

  const { options: subjectOptions, query: subjectQuery } = useSelect({
    resource: "subjects",
    optionLabel: "name",
    optionValue: "id",
  });

  const { options: teacherOptions, loading: teacherLoading, error: teacherError } = useTeachers();

  const handleBannerUpload = async () => {
    setUploading(true);
    setError(null);
    try {
      const result = await openBannerUpload();
      if (result) setBannerData(result); // null = user closed the widget, keep old banner
    } catch (err: any) {
      setError(err?.message ?? "Image upload failed. Try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name || !subjectId || !teacherId) {
      setError("Name, subject, and teacher are required.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setCreating(true);
    createClass(
      {
        resource: "classes",
        values: {
          name,
          description,
          capacity: Number(capacity),
          subject_id: Number(subjectId),
          teacher_id: Number(teacherId),
          ...(bannerData ?? {}),
        },
      },
      {
        onSuccess: () => {
          setCreating(false);
          navigate("/classes");
        },
        onError: (err: any) => {
          setCreating(false);
          setError(err?.message ?? "Failed to create class.");
          window.scrollTo({ top: 0, behavior: "smooth" });
        },
      }
    );
  };

  const inputClass =
    "w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring";
  const labelClass = "block text-sm font-medium text-foreground mb-1";

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Link to="/classes" className="text-sm text-primary hover:underline mb-4 inline-block">
        ← Back to Classes
      </Link>

      <div className="bg-card border border-border rounded-lg p-6">
        <h1 className="text-2xl font-bold text-foreground mb-1">Create Class</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Add a new class section with a subject, teacher, and optional banner image.
        </p>

        {error && (
          <div className="bg-destructive/10 text-destructive text-sm rounded-md px-3 py-2 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
              placeholder="e.g. Python Foundations - Section A"
            />
          </div>

          <div>
            <label className={labelClass}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={inputClass}
              rows={3}
              placeholder="Short description of the class"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Subject</label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className={inputClass}
              >
                <option value="">-- Select a subject --</option>
                {subjectQuery.isLoading && <option>Loading...</option>}
                {(subjectOptions ?? []).map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Teacher</label>
              <select
                value={teacherId}
                onChange={(e) => setTeacherId(e.target.value)}
                className={inputClass}
              >
                <option value="">-- Select a teacher --</option>
                {teacherLoading && <option>Loading...</option>}
                {teacherError && <option disabled>{teacherError}</option>}
                {teacherOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>Capacity</label>
            <input
              type="number"
              value={capacity}
              onChange={(e) => setCapacity(Number(e.target.value))}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Banner Image</label>
            <button
              type="button"
              onClick={handleBannerUpload}
              disabled={uploading}
              className="rounded-md border border-input bg-secondary px-4 py-2 text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
            >
              {uploading ? "Uploading..." : bannerData ? "Change Banner Image" : "Choose Banner Image"}
            </button>
            {bannerData && (
              <img
                src={bannerData.banner_url}
                alt="Banner preview"
                className="mt-3 rounded-md max-h-40 border border-border"
              />
            )}
          </div>

          <button
            type="submit"
            disabled={uploading || creating}
            className="w-full bg-primary text-primary-foreground rounded-md py-2 text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
          >
            {creating ? "Creating..." : "Create Class"}
          </button>
        </form>
      </div>
    </div>
  );
};