import { useEffect, useState } from "react";
import { useOne, useUpdate, useSelect } from "@refinedev/core";
import { useNavigate, useParams, Link } from "react-router";
import { openBannerUpload, type BannerUploadResult } from "../../lib/cloudinary";
import { useTeachers } from "../../hooks/use-teachers";

type ClassRecord = {
  id: number;
  name: string;
  description: string | null;
  capacity: number;
  status: "active" | "archived";
  subject_id: number;
  teacher_id: number;
  banner_url: string | null;
  banner_cld_pub_id: string | null;
};

export const ClassEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { result, query } = useOne<ClassRecord>({ resource: "classes", id: id! });
  const { mutate: updateClass } = useUpdate();
  const { options: subjectOptions } = useSelect({ resource: "subjects", optionLabel: "name", optionValue: "id" });
  const { options: teacherOptions, error: teacherError } = useTeachers();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [capacity, setCapacity] = useState(30);
  const [status, setStatus] = useState<"active" | "archived">("active");
  const [subjectId, setSubjectId] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [banner, setBanner] = useState<BannerUploadResult | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (result) {
      setName(result.name);
      setDescription(result.description ?? "");
      setCapacity(result.capacity);
      setStatus(result.status);
      setSubjectId(String(result.subject_id));
      setTeacherId(String(result.teacher_id));
      setBanner(
        result.banner_url
          ? { banner_url: result.banner_url, banner_cld_pub_id: result.banner_cld_pub_id ?? "" }
          : null
      );
    }
  }, [result]);

  const handleBannerUpload = async () => {
    setUploading(true);
    setError(null);
    try {
      const uploaded = await openBannerUpload();
      if (uploaded) setBanner(uploaded);
    } catch (err: any) {
      setError(err?.message ?? "Image upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name || !subjectId || !teacherId) {
      setError("Name, subject, and teacher are required.");
      return;
    }
    setSaving(true);
    updateClass(
      {
        resource: "classes",
        id: id!,
        values: {
          name,
          description,
          capacity: Number(capacity),
          status,
          subject_id: Number(subjectId),
          teacher_id: Number(teacherId),
          banner_url: banner?.banner_url ?? null,
          banner_cld_pub_id: banner?.banner_cld_pub_id ?? null,
        },
      },
      {
        onSuccess: () => navigate(`/classes/${id}`),
        onError: (err: any) => {
          setSaving(false);
          setError(err?.message ?? "Failed to update class.");
        },
      }
    );
  };

  const inputClass =
    "w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring";
  const labelClass = "block text-sm font-medium text-foreground mb-1";

  if (query.isLoading) return <div className="p-6 text-muted-foreground">Loading...</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Link to={`/classes/${id}`} className="text-sm text-primary hover:underline mb-4 inline-block">
        ← Back to Class
      </Link>
      <div className="bg-card border border-border rounded-lg p-6">
        <h1 className="text-2xl font-bold text-foreground mb-6">Edit Class</h1>
        {error && <div className="bg-destructive/10 text-destructive text-sm rounded-md px-3 py-2 mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className={inputClass} rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Subject</label>
              <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)} className={inputClass}>
                <option value="">-- Select a subject --</option>
                {(subjectOptions ?? []).map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Teacher</label>
              <select value={teacherId} onChange={(e) => setTeacherId(e.target.value)} className={inputClass}>
                <option value="">-- Select a teacher --</option>
                {teacherError && <option disabled>{teacherError}</option>}
                {teacherOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Capacity</label>
              <input
                type="number"
                min={1}
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as "active" | "archived")}
                className={inputClass}
              >
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
          <div>
            <label className={labelClass}>Banner Image</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleBannerUpload}
                disabled={uploading}
                className="rounded-md border border-input bg-secondary px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50"
              >
                {uploading ? "Uploading..." : banner ? "Change Banner" : "Choose Banner"}
              </button>
              {banner && (
                <button type="button" onClick={() => setBanner(null)} className="text-sm text-destructive hover:underline">
                  Remove banner
                </button>
              )}
            </div>
            {banner && (
              <img src={banner.banner_url} alt="Banner preview" className="mt-3 rounded-md max-h-40 border border-border" />
            )}
          </div>
          <button
            type="submit"
            disabled={saving || uploading}
            className="w-full bg-primary text-primary-foreground rounded-md py-2 text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
};