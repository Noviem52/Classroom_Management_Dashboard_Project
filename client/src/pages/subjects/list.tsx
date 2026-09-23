import { useMemo, useState } from "react";
import { useTable } from "@refinedev/react-table";
import { useSelect, useGetIdentity, useDelete } from "@refinedev/core";
import type { ColumnDef } from "@tanstack/react-table";
import { Link } from "react-router";
import { DataTable } from "@/components/refine-ui/data-table/data-table";

type Subject = {
  id: number;
  code: string;
  name: string;
  description: string | null;
  department?: { id: number; name: string };
};

type Identity = { id: number; name: string; role: "student" | "teacher" | "admin" };

export const SubjectList = () => {
  const { data: identity } = useGetIdentity<Identity>();
  const isAdmin = identity?.role === "admin";
  const { mutate: deleteOne } = useDelete();

  const [searchInput, setSearchInput] = useState("");
  const [departmentValue, setDepartmentValue] = useState("");

  const { options: departmentOptions } = useSelect({
    resource: "departments",
    optionLabel: "name",
    optionValue: "name",
  });

  const columns = useMemo<ColumnDef<Subject>[]>(
    () => [
      { accessorKey: "code", header: "Code", size: 110 },
      { accessorKey: "name", header: "Name", size: 220 },
      {
        id: "department",
        header: "Department",
        size: 180,
        accessorFn: (row) => row.department?.name ?? "-",
      },
      {
        id: "actions",
        header: "Actions",
        size: 150,
        cell: ({ row }) =>
          isAdmin ? (
            <div className="flex gap-3">
              <Link to={`/subjects/${row.original.id}/edit`} className="text-sm text-primary hover:underline">
                Edit
              </Link>
              <button
                onClick={() => {
                  if (confirm(`Delete subject "${row.original.name}"?`)) {
                    deleteOne({ resource: "subjects", id: row.original.id });
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

  // ... rest of the file unchanged (const table = useTable..., applyFilters, return JSX)
  const table = useTable<Subject>({
    columns,
    refineCoreProps: { resource: "subjects" },
  });

  const applyFilters = (search: string, department: string) => {
    table.refineCore.setFilters(
      [
        { field: "search", operator: "eq", value: search || undefined },
        { field: "department", operator: "eq", value: department || undefined },
      ],
      "replace"
    );
  };

  return (
    <div className="p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Subjects</h1>
          <p className="text-sm text-muted-foreground mt-1">Browse subjects across every department.</p>
        </div>
        {isAdmin && (
          <Link
            to="/subjects/create"
            className="bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm font-medium hover:opacity-90 transition whitespace-nowrap"
          >
            + Create Subject
          </Link>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") applyFilters(searchInput, departmentValue);
          }}
          placeholder="Search by name or code..."
          className="w-64 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <select
          value={departmentValue}
          onChange={(e) => {
            setDepartmentValue(e.target.value);
            applyFilters(searchInput, e.target.value);
          }}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">All departments</option>
          {(departmentOptions ?? []).map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <button
          onClick={() => applyFilters(searchInput, departmentValue)}
          className="bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm font-medium hover:opacity-90 transition"
        >
          Search
        </button>
        {(searchInput || departmentValue) && (
          <button
            onClick={() => {
              setSearchInput("");
              setDepartmentValue("");
              applyFilters("", "");
            }}
            className="text-sm text-muted-foreground hover:underline"
          >
            Clear
          </button>
        )}
      </div>

      <DataTable table={table} />
    </div>
  );
};