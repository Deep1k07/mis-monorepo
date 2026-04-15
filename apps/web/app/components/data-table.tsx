"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Check, Search, Settings2 } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pageCount?: number;
  page?: number;
  total?: number;
  onPageChange?: (page: number) => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  filterSlot?: React.ReactNode;
  actionSlot?: React.ReactNode;
  initialColumnVisibility?: VisibilityState;
  storageKey?: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pageCount,
  page,
  total,
  onPageChange,
  searchValue,
  onSearchChange,
  filterSlot,
  actionSlot,
  initialColumnVisibility,
  storageKey,
}: DataTableProps<TData, TValue>) {
  const isServerPagination =
    pageCount !== undefined && onPageChange !== undefined;

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>(() => {
      if (typeof window === "undefined" || !storageKey) {
        return initialColumnVisibility ?? {};
      }
      try {
        const stored = window.localStorage.getItem(storageKey);
        if (stored) {
          return {
            ...(initialColumnVisibility ?? {}),
            ...(JSON.parse(stored) as VisibilityState),
          };
        }
      } catch {}
      return initialColumnVisibility ?? {};
    });

  React.useEffect(() => {
    if (!storageKey || typeof window === "undefined") return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(columnVisibility));
    } catch {}
  }, [columnVisibility, storageKey]);
  const [columnsOpen, setColumnsOpen] = React.useState(false);
  const columnsRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (columnsRef.current && !columnsRef.current.contains(e.target as Node)) {
        setColumnsOpen(false);
      }
    }
    if (columnsOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [columnsOpen]);

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    ...(isServerPagination
      ? { manualPagination: true, pageCount }
      : { getPaginationRowModel: getPaginationRowModel() }),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      columnVisibility,
      ...(isServerPagination
        ? { pagination: { pageIndex: (page ?? 1) - 1, pageSize: 10 } }
        : {}),
    },
  });

  const handlePrevious = () => {
    if (isServerPagination) {
      onPageChange((page ?? 1) - 1);
    } else {
      table.previousPage();
    }
  };

  const handleNext = () => {
    if (isServerPagination) {
      onPageChange((page ?? 1) + 1);
    } else {
      table.nextPage();
    }
  };

  const canPreviousPage = isServerPagination
    ? (page ?? 1) > 1
    : table.getCanPreviousPage();
  const canNextPage = isServerPagination
    ? (page ?? 1) < (pageCount ?? 1)
    : table.getCanNextPage();
  const currentPage = isServerPagination
    ? (page ?? 1)
    : table.getState().pagination.pageIndex + 1;
  const totalPages = isServerPagination
    ? (pageCount ?? 1)
    : table.getPageCount() || 1;
  const rowCount = isServerPagination
    ? (total ?? data.length)
    : table.getFilteredRowModel().rows.length;

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-[300px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={
                onSearchChange ? (searchValue ?? "") : (globalFilter ?? "")
              }
              onChange={(event) => {
                if (onSearchChange) {
                  onSearchChange(event.target.value);
                } else {
                  setGlobalFilter(event.target.value);
                }
              }}
              className="pl-8"
            />
          </div>
          {filterSlot}
        </div>
        <div className="flex items-center gap-2">
          {initialColumnVisibility && (
            <div className="relative" ref={columnsRef}>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => setColumnsOpen((prev) => !prev)}
              >
                <Settings2 className="h-4 w-4" />
                Columns
              </Button>
              {columnsOpen && (
                <div className="absolute right-0 top-full z-50 mt-1 w-[180px] rounded-md border bg-popover p-1 shadow-md">
                  <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                    Toggle columns
                  </p>
                  <div className="my-1 h-px bg-border" />
                  {table
                    .getAllColumns()
                    .filter((column) => column.getCanHide())
                    .map((column) => {
                      const isVisible = column.getIsVisible();
                      return (
                        <button
                          key={column.id}
                          onClick={() => column.toggleVisibility(!isVisible)}
                          className="flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm capitalize hover:bg-accent hover:text-accent-foreground"
                        >
                          <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border border-primary">
                            {isVisible && (
                              <Check className="h-3 w-3 text-primary" />
                            )}
                          </span>
                          {typeof column.columnDef.header === "string"
                            ? column.columnDef.header
                            : column.id.replace(/_/g, " ")}
                        </button>
                      );
                    })}
                </div>
              )}
            </div>
          )}
          {actionSlot}
        </div>
      </div>
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{rowCount} row(s) total</p>
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium">
            Page {currentPage} of {totalPages}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevious}
            disabled={!canPreviousPage}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNext}
            disabled={!canNextPage}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
