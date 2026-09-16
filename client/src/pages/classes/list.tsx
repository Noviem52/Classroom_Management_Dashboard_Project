import { useMemo } from "react";
import { useTable } from "@refinedev/react-table";
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

export const ClassList = () => {
  const columns = useMemo<ColumnDef<ClassRow>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
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
        accessorFn: (row) => row.subject?.name ?? "-",
      },
      {
        id: "teacher",
        header: "Teacher",
        accessorFn: (row) => row.teacher?.name ?? "-",
      },
      {
        id: "department",
        header: "Department",
        accessorFn: (row) => row.department?.name ?? "-",
      },
      { accessorKey: "capacity", header: "Capacity" },
      {
        accessorKey: "status",
        header: "Status",
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
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-foreground">Classes</h1>
        <Link
          to="/classes/create"
          className="bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm font-medium hover:opacity-90 transition"
        >
          + Create Class
        </Link>
      </div>
      <DataTable table={table} />
    </div>
  );
};