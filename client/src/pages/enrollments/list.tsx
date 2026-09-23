import { useMemo } from "react";
import { useTable } from "@refinedev/react-table";
import { useGetIdentity } from "@refinedev/core";
import type { ColumnDef } from "@tanstack/react-table";
import { Link } from "react-router";
import { DataTable } from "@/components/refine-ui/data-table/data-table";

type EnrollmentRow = {
  id: number;
  class_id: number;
  enrolled_at: string;
  class?: {
    name: string;
    status: string;
    subject?: { name: string };
    teacher?: { name: string };
  };
};

type Identity = { id: number; role: "student" | "teacher" | "admin" };

export const MyClasses = () => {
  const { data: identity } = useGetIdentity<Identity>();

  const columns = useMemo<ColumnDef<EnrollmentRow>[]>(
    () => [
      {
        id: "class",
        header: "Class",
        size: 240,
        cell: ({ row }) => (
          <Link to={`/classes/${row.original.class_id}`} className="text-primary font-medium hover:underline">
            {row.original.class?.name ?? "-"}
          </Link>
        ),
      },
      { id: "subject", header: "Subject", accessorFn: (r) => r.class?.subject?.name ?? "-" },
      { id: "teacher", header: "Teacher", accessorFn: (r) => r.class?.teacher?.name ?? "-" },
      { id: "status", header: "Status", accessorFn: (r) => r.class?.status ?? "-" },
      {
        id: "enrolled_at",
        header: "Joined",
        accessorFn: (r) => new Date(r.enrolled_at).toLocaleDateString(),
      },
    ],
    []
  );

  const table = useTable<EnrollmentRow>({
    columns,
    refineCoreProps: { resource: "enrollments" },
  });

  return (
    <div className="p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Classes</h1>
          <p className="text-sm text-muted-foreground mt-1">Classes you are enrolled in.</p>
        </div>
        {identity?.role === "student" && (
          <Link
            to="/join"
            className="bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm font-medium hover:opacity-90 whitespace-nowrap"
          >
            + Join a Class
          </Link>
        )}
      </div>
      {identity && identity.role !== "student" ? (
        <p className="text-sm text-muted-foreground">Only students can enroll in classes.</p>
      ) : (
        <DataTable table={table} />
      )}
    </div>
  );
};