import { useMemo } from "react";
import { useTable } from "@refinedev/react-table";
import { useGetIdentity, useDelete } from "@refinedev/core";
import type { ColumnDef } from "@tanstack/react-table";
import { Link } from "react-router";
import { DataTable } from "@/components/refine-ui/data-table/data-table";

type Department = {
  id: number;
  code: string;
  name: string;
  description: string | null;
};

type Identity = { id: number; name: string; role: "student" | "teacher" | "admin" };

export const DepartmentList = () => {
  const { data: identity } = useGetIdentity<Identity>();
  const isAdmin = identity?.role === "admin";
  const { mutate: deleteOne } = useDelete();

  const columns = useMemo<ColumnDef<Department>[]>(
    () => [
      { accessorKey: "code", header: "Code", size: 110 },
      { accessorKey: "name", header: "Name", size: 220 },
      {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => row.original.description ?? "-",
      },
       {
        id: "actions",
        header: "Actions",
        size: 150,
        cell: ({ row }) =>
          isAdmin ? (
            <div className="flex gap-3">
              <Link to={`/departments/${row.original.id}/edit`} className="text-sm text-primary hover:underline">
                Edit
              </Link>
              <button
                onClick={() => {
                  if (confirm(`Delete department "${row.original.name}"?`)) {
                    deleteOne({ resource: "departments", id: row.original.id });
                  }
                }}
                className="text-sm text-destructive hover:underline"
              >
                Delete
              </button>
            </div>
          ) : null,
      },
    ],
    [isAdmin, deleteOne]
  );

  const table = useTable<Department>({
    columns,
    refineCoreProps: { resource: "departments" },
  });

  return (
    <div className="p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Departments</h1>
          <p className="text-sm text-muted-foreground mt-1">All academic departments.</p>
        </div>
        {isAdmin && (
          <Link
            to="/departments/create"
            className="bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm font-medium hover:opacity-90 transition whitespace-nowrap"
          >
            + Create Department
          </Link>
        )}
      </div>
      <DataTable table={table} />
    </div>
  );
};