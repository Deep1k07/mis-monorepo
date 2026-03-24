import { cookies } from "next/headers";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import { EntityClient } from "./components/entity-client";
import { EntityDialog } from "./components/entity-dialog";

async function getEntities() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c: any) => `${c.name}=${c.value}`)
    .join("; ");

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/entity/get-all`,
      {
        headers: {
          Cookie: cookieHeader,
        },
        cache: "no-store",
      },
    );

    if (!res.ok) {
      return [];
    }

    const json = await res.json();
    return Array.isArray(json) ? json : json?.data || [];
  } catch (error) {
    console.error("Error fetching entities:", error);
    return [];
  }
}

export default async function EntityPage() {
  const entities = await getEntities();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between border-b px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Entities</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="flex items-center space-x-2">
            <EntityDialog />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 lg:p-8">
          <div className="flex flex-col space-y-4">
            <h2 className="text-3xl font-bold tracking-tight">Entities</h2>
            <p className="text-muted-foreground">
              Manage your direct clients and business associate managed
              entities.
            </p>
          </div>
          <EntityClient data={entities} />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
