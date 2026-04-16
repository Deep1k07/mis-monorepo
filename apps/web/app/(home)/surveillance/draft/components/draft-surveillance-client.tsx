"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/data-table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useDraftSurveillanceList } from "@/utils/apis";
import { useDebounce } from "@/utils/useDebounce";
import { useQueryParams } from "@/utils/useQueryParams";
import { createDraftSurveillanceColumns } from "./columns";

type SurveillanceType = "first" | "second";

function DraftSurveillanceTable({ type }: { type: SurveillanceType }) {
  const router = useRouter();
  const { get, getNumber, set } = useQueryParams();

  const page = getNumber("page", 1);
  const searchInput = get("search");
  const search = useDebounce(searchInput);

  const columns = useMemo(
    () =>
      createDraftSurveillanceColumns((row) => {
        router.push(`/surveillance/draft/view/${type}/${row._id}`);
      }),
    [router, type],
  );

  const { data, totalPages, total, isLoading } = useDraftSurveillanceList(
    type,
    page,
    search,
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
        />
      )}
    </>
  );
}

export function DraftSurveillanceClient() {
  const { get, set } = useQueryParams();
  const tab: SurveillanceType = get("tab") === "second" ? "second" : "first";

  return (
    <Tabs
      value={tab}
      onValueChange={(value) =>
        set({ tab: value as string, page: 1, search: "" })
      }
      className="w-full"
    >
      <TabsList>
        <TabsTrigger value="first">1st Surveillance</TabsTrigger>
        <TabsTrigger value="second">2nd Surveillance</TabsTrigger>
      </TabsList>
      <TabsContent value="first" className="mt-4">
        {tab === "first" && <DraftSurveillanceTable type="first" />}
      </TabsContent>
      <TabsContent value="second" className="mt-4">
        {tab === "second" && <DraftSurveillanceTable type="second" />}
      </TabsContent>
    </Tabs>
  );
}
