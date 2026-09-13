export async function uploadBanner(file: File) {
  const token = localStorage.getItem("token");
  const res = await fetch(
    `${import.meta.env.VITE_BACKEND_BASE_URL}/uploads/presign`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ filename: file.name, content_type: file.type }),
    }
  );
  const { data } = await res.json();

  const put = await fetch(data.upload_url, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!put.ok) throw new Error("Upload failed");

  return { banner_url: data.public_url, banner_object_key: data.object_key };
}