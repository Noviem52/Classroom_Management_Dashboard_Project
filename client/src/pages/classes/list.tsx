import { useTable } from "@refinedev/core";

export const ClassList = () => {
  const { tableQuery, result } = useTable({
    resource: "classes",
  });

  if (tableQuery.isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Classes</h1>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Subject</th>
            <th>Teacher</th>
            <th>Department</th>
            <th>Capacity</th>
          </tr>
        </thead>
        <tbody>
          {result?.data?.map((cls: any) => (
            <tr key={cls.id}>
              <td>{cls.name}</td>
              <td>{cls.subject?.name}</td>
              <td>{cls.teacher?.name}</td>
              <td>{cls.department?.name}</td>
              <td>{cls.capacity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};