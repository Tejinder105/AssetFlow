"use client"

import * as React from "react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
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
import { LayoutDashboardIcon, SettingsIcon, PackageIcon, ArrowRightLeftIcon, CalendarClockIcon, WrenchIcon, ClipboardCheckIcon, FileTextIcon, BellIcon, CommandIcon, ListIcon, ChartBarIcon, FolderIcon, UsersIcon, CameraIcon, Settings2Icon, CircleHelpIcon, SearchIcon, DatabaseIcon, FileChartColumnIcon, FileIcon } from "lucide-react"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
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
    },
    {
      title: "Reports",
      url: "/reports",
      icon: (
        <FileTextIcon />
      ),
    },
    {
      title: "Notifications",
      url: "/notifications",
      icon: (
        <BellIcon />
      ),
    },
  ],
  
}
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              render={<a href="#" />}
            >
              <CommandIcon className="size-5!" />
              <span className="text-base font-semibold">Acme Inc.</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
