"use client"

import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useCurrentUser } from "@/features/auth/hooks"
import { can } from "@/lib/permissions"
import { LayoutDashboardIcon, SettingsIcon, PackageIcon, ArrowRightLeftIcon, CalendarClockIcon, WrenchIcon, ClipboardCheckIcon, FileTextIcon, BellIcon } from "lucide-react"

const navMain = [
    {
      title: "Dashboard",
      url: "/dashboard",
      isActive: true,
      icon: (
        <LayoutDashboardIcon />
      ),
    },
    {
      title: "Organization setup",
      url: "/organization",
      icon: (
        <SettingsIcon />
      ),
      action: "manageOrganization",
    },
    {
      title: "Assets",
      url: "/assets",
      icon: (
        <PackageIcon />
      ),
    },
    {
      title: "Allocation & Transfer",
      url: "/allocations",
      icon: (
        <ArrowRightLeftIcon />
      ),
    },
    {
      title: "Resource Booking",
      url: "/bookings",
      icon: (
        <CalendarClockIcon />
      ),
    },
    {
      title: "Maintenance",
      url: "/maintenance",
      icon: (
        <WrenchIcon />
      ),
    },
    {
      title: "Audit",
      url: "/audits",
      icon: (
        <ClipboardCheckIcon />
      ),
      action: "manageAudits",
    },
    {
      title: "Reports",
      url: "/reports",
      icon: (
        <FileTextIcon />
      ),
      action: "viewAnalytics",
    },
    {
      title: "Notifications",
      url: "/notifications",
      icon: (
        <BellIcon />
      ),
    },
] as const
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = useCurrentUser()
  const visibleNavigation = navMain.filter(
    (item) => !('action' in item) || can(user?.role, item.action)
  )

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              render={<a href="#" />}
            >
              <span className="text-base font-semibold">AssetFlow</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={visibleNavigation} showQuickCreate={can(user?.role, "registerAssets")} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user ? { name: user.name, email: user.email } : { name: "", email: "" }} />
      </SidebarFooter>
    </Sidebar>
  )
}
