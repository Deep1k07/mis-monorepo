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
  ShieldCheck,
  UserCog,
  Briefcase,
} from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { ProfileModal } from "@/components/profile-modal";
import { ThemeToggle } from "@/components/theme-toggle";

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
  permission?: string | string[];
  children?: {
    title: string;
    url: string;
    icon?: React.ElementType;
    permission?: string | string[];
  }[];
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
    permission: ["entity:read", "entity:read:all"],
  },
  {
    title: "Initial Application",
    url: "/application",
    icon: FileText,
    isActive: false,
    permission: ["manage:application:initial"],
    children: [
      {
        title: "All Application",
        url: "/application",
        icon: List,
        permission: ["application:read", "application:read:all"],
      },
      {
        title: "Draft Application",
        url: "/application/draft",
        icon: List,
        permission: "application:read:draft",
      },
      {
        title: "Final Application",
        url: "/application/final",
        icon: List,
        permission: "application:read:final",
      },
    ],
  },
  {
    title: "Surveillance",
    url: "/surveillance",
    icon: FileText,
    isActive: false,
    permission: ["manage:surveillance"],
    children: [
      {
        title: "All Surveillance",
        url: "/surveillance",
        icon: List,
        permission: ["surveillance:read"],
      },
    ]
  },
  {
    title: "Manage CAB & Standard",
    url: "/manage-cab",
    icon: ShieldCheck,
    isActive: false,
    permission: "cab-standard:read",
  },
  {
    title: "Manage BA",
    url: "/manage-ba",
    icon: Briefcase,
    isActive: false,
    permission: ["ba:read", "ba:read:all"],
  },
  {
    title: "Manage User",
    url: "/manage-user",
    icon: UserCog,
    isActive: false,
    permission: ["manage:users"],
  },
];

function CollapsibleNavItem({
  item,
  pathname,
  hasPermission,
}: {
  item: NavItem;
  pathname: string;
  hasPermission: (p: string) => boolean;
}) {
  const [open, setOpen] = React.useState(pathname.startsWith(item.url));

  const filteredChildren = item.children?.filter((child) => {
    if (!child.permission) return true;
    if (Array.isArray(child.permission)) {
      return child.permission.some((p) => hasPermission(p));
    }
    return hasPermission(child.permission);
  });

  if (!filteredChildren || filteredChildren.length === 0) return null;

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
          {filteredChildren.map((child) => (
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
  const [profileOpen, setProfileOpen] = React.useState(false);

  const filteredNav = navItems.filter((item) => {
    if (!item.permission) return true;
    if (Array.isArray(item.permission)) {
      return item.permission.some((p) => hasPermission(p));
    }
    return hasPermission(item.permission);
  });

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
    <>
      <ProfileModal open={profileOpen} onOpenChange={setProfileOpen} />
      <Sidebar {...props}>
        <SidebarHeader>
          <div className="flex items-center px-2 py-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo1.png"
              alt="Logo"
              className="h-8 w-auto dark:hidden"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="Logo"
              className="h-8 w-auto hidden dark:block"
            />
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
                      hasPermission={hasPermission}
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
              <div className="flex items-center justify-between py-2 px-2">
                <button
                  onClick={() => setProfileOpen(true)}
                  className="flex flex-row items-center gap-3 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 p-1.5 pr-3 transition-colors"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 shrink-0">
                    <User className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                  </div>
                  <div className="flex flex-col text-left">
                    {user && (
                      <span className="font-medium text-sm text-slate-700 dark:text-slate-300">
                        {user.firstName} {user.lastName}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {user?.role}
                    </span>
                  </div>
                </button>
                <div className="flex items-center gap-1">
                  <ThemeToggle />
                  <button
                    onClick={handleLogout}
                    className="flex h-8 w-8 items-center justify-center rounded-md text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20 transition-colors"
                    title="Logout"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
    </>
  );
}
