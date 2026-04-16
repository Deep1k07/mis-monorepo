"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/data-table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSurveillanceList } from "@/utils/apis";
import { useDebounce } from "@/utils/useDebounce";
import { useQueryParams } from "@/utils/useQueryParams";
import { createSurveillanceColumns } from "./columns";

type SurveillanceType = "first" | "second";

function SurveillanceTable({ type }: { type: SurveillanceType }) {
  const router = useRouter();
  const { get, getNumber, set } = useQueryParams();

  const page = getNumber("page", 1);
  const searchInput = get("search");
  const search = useDebounce(searchInput);
  const status = get("status");

  const columns = useMemo(
    () =>
      createSurveillanceColumns((row) => {
        router.push(`/surveillance/view/${type}/${row._id}`);
      }),
    [router, type],
  );

  const {
    data,
    totalPages,
    total,
    isLoading,
  } = useSurveillanceList(type, page, search, status || undefined);

  return (
    <>
      {isLoading ? (
        <div className="flex items-center justify-center py-10 text-muted-foreground">
          Loading...
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={data}
          pageCount={totalPages}
          page={page}
          total={total}
          onPageChange={(p) => set({ page: p })}
          searchValue={searchInput}
          onSearchChange={(value) => set({ search: value, page: 1 })}
          filterSlot={
            <Select
              value={status || null}
              onValueChange={(val) =>
                set({
                  status: !val || val === "all" ? "" : val,
                  page: 1,
                })
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Surveillance Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="inprogress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="withdrawn">Withdrawn</SelectItem>
              </SelectContent>
            </Select>
          }
        />
      )}
    </>
  );
}

export function SurveillanceClient() {
  const { get, set } = useQueryParams();
  const tab: SurveillanceType =
    get("tab") === "second" ? "second" : "first";

  return (
    <Tabs
      value={tab}
      onValueChange={(value) =>
        set({ tab: value as string, page: 1, status: "", search: "" })
      }
      className="w-full"
    >
      <TabsList>
        <TabsTrigger value="first">1st Surveillance</TabsTrigger>
        <TabsTrigger value="second">2nd Surveillance</TabsTrigger>
      </TabsList>
      <TabsContent value="first" className="mt-4">
        {tab === "first" && <SurveillanceTable type="first" />}
      </TabsContent>
      <TabsContent value="second" className="mt-4">
        {tab === "second" && <SurveillanceTable type="second" />}
      </TabsContent>
    </Tabs>
  );
}
