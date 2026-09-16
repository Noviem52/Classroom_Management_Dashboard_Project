import { useShow } from "@refinedev/core";
import { useParams } from "react-router";

export const ClassShow = () => {
  const { id } = useParams();
  const { query, result } = useShow({
    resource: "classes",
    id,
  });

  if (query.isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1>{result?.name}</h1>
      <p>{result?.description}</p>
      <p><strong>Capacity:</strong> {result?.capacity}</p>
      <p><strong>Status:</strong> {result?.status}</p>
      <p><strong>Subject:</strong> {result?.subject?.name}</p>
      <p><strong>Teacher:</strong> {result?.teacher?.name} ({result?.teacher?.email})</p>
      <p><strong>Department:</strong> {result?.department?.name}</p>
    </div>
  );
};