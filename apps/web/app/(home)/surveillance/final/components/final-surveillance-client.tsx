"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/data-table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useFinalSurveillanceList } from "@/utils/apis";
import { useDebounce } from "@/utils/useDebounce";
import { useQueryParams } from "@/utils/useQueryParams";
import { createFinalSurveillanceColumns } from "./columns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SurveillanceType = "first" | "second";

const QUALITY_STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "completed", label: "Completed" },
  { value: "rejected", label: "Rejected" },
];

function FinalSurveillanceTable({ type }: { type: SurveillanceType }) {
  const router = useRouter();
  const { get, getNumber, set } = useQueryParams();

  const page = getNumber("page", 1);
  const searchInput = get("search");
  const search = useDebounce(searchInput);
  const qualityStatus = get("qualityStatus");

  const columns = useMemo(
    () =>
      createFinalSurveillanceColumns((row) => {
        router.push(`/surveillance/final/view/${type}/${row._id}`);
      }),
    [router, type],
  );

  const { data, totalPages, total, isLoading } = useFinalSurveillanceList(
    type,
    page,
    search,
    qualityStatus || undefined,
  );

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
              value={qualityStatus || "all"}
              onValueChange={(value) =>
                set({
                  qualityStatus:
                    !value || value === "all" ? undefined : value,
                  page: 1,
                })
              }
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue>
                  {qualityStatus
                    ? (QUALITY_STATUS_OPTIONS.find(
                        (o) => o.value === qualityStatus,
                      )?.label ?? qualityStatus)
                    : "Quality Status"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Quality Statuses</SelectItem>
                {QUALITY_STATUS_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          }
        />
      )}
    </>
  );
}

export function FinalSurveillanceClient() {
  const { get, set } = useQueryParams();
  const tab: SurveillanceType = get("tab") === "second" ? "second" : "first";

  return (
    <Tabs
      value={tab}
      onValueChange={(value) =>
        set({ tab: value as string, page: 1, search: "", qualityStatus: "" })
      }
      className="w-full"
    >
      <TabsList>
        <TabsTrigger value="first">1st Surveillance</TabsTrigger>
        <TabsTrigger value="second">2nd Surveillance</TabsTrigger>
      </TabsList>
      <TabsContent value="first" className="mt-4">
        {tab === "first" && <FinalSurveillanceTable type="first" />}
      </TabsContent>
      <TabsContent value="second" className="mt-4">
        {tab === "second" && <FinalSurveillanceTable type="second" />}
      </TabsContent>
    </Tabs>
  );
}
