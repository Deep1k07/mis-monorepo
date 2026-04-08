"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Search } from "lucide-react";

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
}: DataTableProps<TData, TValue>) {
  const isServerPagination =
    pageCount !== undefined && onPageChange !== undefined;

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [globalFilter, setGlobalFilter] = React.useState("");

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
    state: {
      sorting,
      columnFilters,
      globalFilter,
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
        {actionSlot}
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
