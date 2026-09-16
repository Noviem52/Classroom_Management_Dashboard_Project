import { useMemo } from "react";
import { useTable } from "@refinedev/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/refine-ui/data-table/data-table";

type Department = {
  id: number;
  code: string;
  name: string;
  description: string | null;
};

export const DepartmentList = () => {
  const columns = useMemo<ColumnDef<Department>[]>(
    () => [
      { accessorKey: "code", header: "Code" },
      { accessorKey: "name", header: "Name" },
      {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => row.original.description ?? "-",
      },
    ],
    []
  );

  const table = useTable<Department>({
    columns,
    refineCoreProps: {
      resource: "departments",
    },
  });

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4 text-foreground">Departments</h1>
      <DataTable table={table} />
    </div>
  );
};