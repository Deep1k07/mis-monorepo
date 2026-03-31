"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CabList } from "./cab-list";
import { StandardList } from "./standard-list";

export function ManageCabClient() {
  const [activeTab, setActiveTab] = useState("cab");

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <TabsList>
        <TabsTrigger value="cab">Certification Bodies</TabsTrigger>
        <TabsTrigger value="standard">Standards</TabsTrigger>
      </TabsList>
      <TabsContent value="cab">
        <CabList />
      </TabsContent>
      <TabsContent value="standard">
        <StandardList />
      </TabsContent>
    </Tabs>
  );
}
