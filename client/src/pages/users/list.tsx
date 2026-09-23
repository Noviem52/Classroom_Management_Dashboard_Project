import { useMemo } from "react";
import { useTable } from "@refinedev/react-table";
import { useGetIdentity, useDelete } from "@refinedev/core";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/refine-ui/data-table/data-table";

type UserRow = { id: number; name: string; email: string; role: "student" | "teacher" | "admin" };
type Identity = { id: number; role: "student" | "teacher" | "admin" };

export const UserList = () => {
  const { data: identity } = useGetIdentity<Identity>();
  const isAdmin = identity?.role === "admin";
  const { mutate: deleteOne } = useDelete();

  const columns = useMemo<ColumnDef<UserRow>[]>(
    () => [
      { accessorKey: "name", header: "Name", size: 200 },
      { accessorKey: "email", header: "Email", size: 240 },
      {
        accessorKey: "role",
        header: "Role",
        size: 110,
        cell: ({ row }) => (
          <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
            {row.original.role}
          </span>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        size: 100,
        cell: ({ row }) =>
          row.original.id !== identity?.id ? (
            <button
              onClick={() => {
                if (confirm(`Delete user "${row.original.name}"?`)) {
                  deleteOne({ resource: "users", id: row.original.id });
                }
              }}
              className="text-sm text-destructive hover:underline"
            >
              Delete
            </button>
          ) : (
            <span className="text-xs text-muted-foreground">You</span>
          ),
      },
    ],
    [identity?.id, deleteOne]
  );

  const table = useTable<UserRow>({ columns, refineCoreProps: { resource: "users" } });

  if (identity && !isAdmin) {
    return <div className="p-6 text-muted-foreground">Only administrators can view this page.</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-foreground">Users</h1>
      <p className="text-sm text-muted-foreground mt-1 mb-6">All registered students, teachers, and admins.</p>
      <DataTable table={table} />
    </div>
  );
};