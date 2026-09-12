import { useTable } from "@refinedev/core";

export const SubjectList = () => {
  const { tableQuery, result } = useTable({
    resource: "subjects",
  });

  if (tableQuery.isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Subjects</h1>
      <table>
        <thead>
          <tr>
            <th>Code</th>
            <th>Name</th>
            <th>Department</th>
          </tr>
        </thead>
        <tbody>
          {result?.data?.map((subject: any) => (
            <tr key={subject.id}>
              <td>{subject.code}</td>
              <td>{subject.name}</td>
              <td>{subject.department?.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};