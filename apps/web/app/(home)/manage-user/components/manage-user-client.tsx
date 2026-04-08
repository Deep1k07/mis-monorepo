"use client";

import { Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQueryParams } from "@/utils/useQueryParams";
import { PermissionList } from "./permission-list";
import { RoleList } from "./role-list";
import { UserList } from "./user-list";

export function ManageUserClient() {
  const { get, set } = useQueryParams();
  const activeTab = get("tab", "permissions");

  return (
    <Tabs
      value={activeTab}
      onValueChange={(tab) => set({ tab, page: undefined, search: undefined })}
      className="space-y-4"
    >
      <TabsList>
        <TabsTrigger value="permissions">Permissions</TabsTrigger>
        <TabsTrigger value="roles">Roles</TabsTrigger>
        <TabsTrigger value="users">Users</TabsTrigger>
      </TabsList>
      <TabsContent value="permissions">
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-10 text-muted-foreground">
              Loading...
            </div>
          }
        >
          <PermissionList />
        </Suspense>
      </TabsContent>
      <TabsContent value="roles">
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-10 text-muted-foreground">
              Loading...
            </div>
          }
        >
          <RoleList />
        </Suspense>
      </TabsContent>
      <TabsContent value="users">
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-10 text-muted-foreground">
              Loading...
            </div>
          }
        >
          <UserList />
        </Suspense>
      </TabsContent>
    </Tabs>
  );
}
