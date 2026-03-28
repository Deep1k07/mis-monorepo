"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Database,
  LogOut,
  User,
  FileText,
  ChevronRight,
  List,
} from "lucide-react";
import { useAuthStore } from "@/store/auth-store";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarRail,
} from "@/components/ui/sidebar";

type NavItem = {
  title: string;
  url: string;
  icon: React.ElementType;
  isActive?: boolean;
  permission?: string;
  children?: { title: string; url: string; icon?: React.ElementType }[];
};

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
    isActive: true,
  },
  {
    title: "Entities",
    url: "/entity",
    icon: Database,
    isActive: false,
    permission: "entity:read",
  },
  {
    title: "Initial Application",
    url: "/application",
    icon: FileText,
    isActive: false,
    permission: "application:read",
    children: [
      {
        title: "All Application",
        url: "/application",
        icon: List,
      },
    ],
  },
];

function CollapsibleNavItem({
  item,
  pathname,
}: {
  item: NavItem;
  pathname: string;
}) {
  const [open, setOpen] = React.useState(pathname.startsWith(item.url));

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        onClick={() => setOpen((prev) => !prev)}
        isActive={pathname.startsWith(item.url)}
      >
        <div className="flex items-center gap-2 w-full">
          <item.icon className="h-4 w-4 shrink-0" />
          <span className="flex-1">{item.title}</span>
          <ChevronRight
            className={`h-4 w-4 shrink-0 transition-transform duration-200 ${open ? "rotate-90" : ""}`}
          />
        </div>
      </SidebarMenuButton>
      {open && (
        <SidebarMenuSub>
          {item.children!.map((child) => (
            <SidebarMenuSubItem key={child.title}>
              <SidebarMenuSubButton
                render={<Link href={child.url} />}
                isActive={pathname === child.url}
              >
                {child.icon && <child.icon className="h-3.5 w-3.5 shrink-0" />}
                <span>{child.title}</span>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          ))}
        </SidebarMenuSub>
      )}
    </SidebarMenuItem>
  );
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, hasPermission, logout: clearUser } = useAuthStore();

  const filteredNav = navItems.filter(
    (item) => !item.permission || hasPermission(item.permission),
  );

  const handleLogout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (e) {
      console.error(e);
    } finally {
      clearUser();
      router.push("/login");
    }
  };

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <div className="flex items-center px-2 py-2">
          <img src="/logo1.png" alt="Logo" className="h-8 w-auto" />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredNav.map((item) =>
                item.children ? (
                  <CollapsibleNavItem
                    key={item.title}
                    item={item}
                    pathname={pathname}
                  />
                ) : (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      render={<Link href={item.url} />}
                      isActive={pathname === item.url}
                    >
                      <div className="flex items-center gap-2">
                        <item.icon className="h-4 w-4 shrink-0" />
                        <span>{item.title}</span>
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ),
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              className="w-full flex items-center justify-between text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 py-6"
            >
              <div className="flex flex-row items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 shrink-0">
                  <User className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                </div>
                <div className="flex flex-col">
                  {user && (
                    <span className="font-medium text-sm text-slate-700 dark:text-slate-300">
                      {user.firstName} {user.lastName}
                    </span>
                  )}
                  <span className="font-medium text-xs">Logout</span>
                </div>
              </div>
              <LogOut className="h-4 w-4 shrink-0" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
