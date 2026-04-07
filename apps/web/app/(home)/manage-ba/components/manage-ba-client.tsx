"use client";

import { Suspense } from "react";
import { BaList } from "./ba-list";

export function ManageBaClient() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-10 text-muted-foreground">
          Loading...
        </div>
      }
    >
      <BaList />
    </Suspense>
  );
}
