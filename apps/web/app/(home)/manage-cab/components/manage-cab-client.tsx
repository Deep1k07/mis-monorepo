"use client";

import { Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQueryParams } from "@/utils/useQueryParams";
import { CabList } from "./cab-list";
import { StandardList } from "./standard-list";

export function ManageCabClient() {
  const { get, set } = useQueryParams();
  const activeTab = get("tab", "cab");

  return (
    <Tabs value={activeTab} onValueChange={(tab) => set({ tab, page: undefined, search: undefined, cab: undefined })} className="space-y-4">
      <TabsList>
        <TabsTrigger value="cab">Certification Bodies</TabsTrigger>
        <TabsTrigger value="standard">Standards</TabsTrigger>
      </TabsList>
      <TabsContent value="cab">
        <Suspense fallback={<div className="flex items-center justify-center py-10 text-muted-foreground">Loading...</div>}>
          <CabList />
        </Suspense>
      </TabsContent>
      <TabsContent value="standard">
        <Suspense fallback={<div className="flex items-center justify-center py-10 text-muted-foreground">Loading...</div>}>
          <StandardList />
        </Suspense>
      </TabsContent>
    </Tabs>
  );
}
