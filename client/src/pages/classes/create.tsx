import { useState } from "react";
import { useCreate, useSelect } from "@refinedev/core";
import { useNavigate } from "react-router";
import { uploadBanner } from "../../lib/upload";

export const ClassCreate = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [capacity, setCapacity] = useState(30);
  const [subjectId, setSubjectId] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { mutate: createClass } = useCreate();

  const { options: subjectOptions, query: subjectQuery } = useSelect({
    resource: "subjects",
    optionLabel: "name",
    optionValue: "id",
  });

  const { options: teacherOptions, query: teacherQuery } = useSelect({
    resource: "users",
    optionLabel: "name",
    optionValue: "id",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name || !subjectId || !teacherId) {
      setError("Name, subject, and teacher are required.");
      return;
    }

    let bannerData = {};
    if (file) {
      setUploading(true);
      try {
        bannerData = await uploadBanner(file);
      } catch (err) {
        setError("Image upload failed. Try again.");
        setUploading(false);
        return;
      }
      setUploading(false);
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
          ...bannerData,
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
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1>Create Class</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <div>
        <label>Name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      <div>
        <label>Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div>
        <label>Capacity</label>
        <input
          type="number"
          value={capacity}
          onChange={(e) => setCapacity(Number(e.target.value))}
        />
      </div>

      <div>
        <label>Subject</label>
        <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
          <option value="">-- Select a subject --</option>
          {subjectQuery.isLoading && <option>Loading...</option>}
          {subjectOptions?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label>Teacher</label>
        <select value={teacherId} onChange={(e) => setTeacherId(e.target.value)}>
          <option value="">-- Select a teacher --</option>
          {teacherQuery.isLoading && <option>Loading...</option>}
          {teacherOptions?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label>Banner Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      </div>

      <button type="submit" disabled={uploading || creating}>
        {uploading
          ? "Uploading image..."
          : creating
          ? "Creating..."
          : "Create Class"}
      </button>
    </form>
  );
};