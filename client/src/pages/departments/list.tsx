import { useTable } from "@refinedev/core";

export const DepartmentList = () => {
  const { tableQuery, result } = useTable({
    resource: "departments",
  });

  if (tableQuery.isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Departments</h1>
      <table>
        <thead>
          <tr>
            <th>Code</th>
            <th>Name</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {result?.data?.map((department: any) => (
            <tr key={department.id}>
              <td>{department.code}</td>
              <td>{department.name}</td>
              <td>{department.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};