import { useMemo } from "react";
import { useTable } from "@refinedev/react-table";
import { useGetIdentity } from "@refinedev/core";
import type { ColumnDef } from "@tanstack/react-table";
import { Link } from "react-router";
import { DataTable } from "@/components/refine-ui/data-table/data-table";

type ClassRow = {
  id: number;
  name: string;
  capacity: number;
  status: string;
  subject?: { name: string };
  teacher?: { name: string };
  department?: { name: string };
};

type Identity = {
  id: number;
  name: string;
  role: "student" | "teacher" | "admin";
};

export const ClassList = () => {
  const { data: identity } = useGetIdentity<Identity>();
  const canCreate = identity?.role === "teacher" || identity?.role === "admin";

  const columns = useMemo<ColumnDef<ClassRow>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        size: 240,
        cell: ({ row }) => (
          <Link
            to={`/classes/${row.original.id}`}
            className="text-primary font-medium hover:underline"
          >
            {row.original.name}
          </Link>
        ),
      },
      {
        id: "subject",
        header: "Subject",
        size: 180,
        accessorFn: (row) => row.subject?.name ?? "-",
      },
      {
        id: "teacher",
        header: "Teacher",
        size: 160,
        accessorFn: (row) => row.teacher?.name ?? "-",
      },
      {
        id: "department",
        header: "Department",
        size: 180,
        accessorFn: (row) => row.department?.name ?? "-",
      },
      { accessorKey: "capacity", header: "Capacity", size: 100 },
      {
        accessorKey: "status",
        header: "Status",
        size: 110,
        cell: ({ row }) => (
          <span
            className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
              row.original.status === "active"
                ? "bg-secondary text-secondary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {row.original.status}
          </span>
        ),
      },
    ],
    []
  );

  const table = useTable<ClassRow>({
    columns,
    refineCoreProps: {
      resource: "classes",
    },
  });

  return (
    <div className="p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Classes</h1>
          <p className="text-sm text-muted-foreground mt-1">
            All class sections across every department.
          </p>
        </div>
        {canCreate && (
          <Link
            to="/classes/create"
            className="bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm font-medium hover:opacity-90 transition whitespace-nowrap"
          >
            + Create Class
          </Link>
        )}
      </div>
      <DataTable table={table} />
    </div>
  );
};