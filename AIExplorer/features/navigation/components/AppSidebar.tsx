"use client"
/* eslint-disable @next/next/no-img-element */

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import * as React from "react"
import { useMsal } from "@azure/msal-react"
import {
  Award,
  BarChart2,
  FileText,
  Folder,
  LogOut,
  Search,
  LayoutDashboard,
} from "lucide-react"
import { getRouteState } from "@/lib/navigation-state"
import { NAV_ITEMS, type NavIconKey } from "@/features/navigation/config"

import {
  Sidebar as UISidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

const iconMap: Record<NavIconKey, typeof LayoutDashboard> = {
  dashboard: LayoutDashboard,
  gallery: Search,
  submit: FileText,
  "my-use-cases": Folder,
  metrics: BarChart2,
  champion: Award,
}

const extraMatches: Record<string, string[]> = {
  "/metric-reporting": ["/metrics"],
  "/my-use-cases": [
    "/meaningful-update",
    "/status",
    "/add-agent-library",
    "/add-timeline",
    "/use-case-details",
  ],
  "/champion": [
    "/approval",
    "/metadata-reporting",
    "/status",
    "/meaningful-update",
    "/add-agent-library",
    "/add-timeline",
    "/use-case-details",
  ],
}

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { instance, accounts } = useMsal()
  const { state } = useSidebar()
  const navItems = React.useMemo(() => NAV_ITEMS, [])

  const handleLogout = () => {
    instance
      .logoutPopup({
        postLogoutRedirectUri: "/login",
        mainWindowRedirectUri: "/login",
      })
      .catch((error) => {
        console.error("Logout error:", error)
      })
  }

  const isActive = (path: string) => {
    if (pathname === path || pathname.startsWith(`${path}/`)) {
      return true
    }

    // Special handling for related pages
    if (path === "/my-use-cases" || path === "/champion") {
      const extras = extraMatches[path]
      if (!extras) return false

      const isOnExtraPage = extras.some((extra) => pathname.startsWith(extra))
      if (!isOnExtraPage) return false

      // Check the source screen from route state
      const routeState = getRouteState(pathname) as { sourceScreen?: string } | null
      const sourceScreen = routeState?.sourceScreen

      if (path === "/my-use-cases") {
        return sourceScreen === 'my-use-cases'
      } else if (path === "/champion") {
        return sourceScreen === 'champion'
      }
    }

    const extras = extraMatches[path]
    if (!extras) return false
    return extras.some((extra) => pathname.startsWith(extra))
  }

  const userInitial =
    accounts[0]?.name?.charAt(0).toUpperCase() ??
    accounts[0]?.username?.charAt(0).toUpperCase() ??
    "U"
  const displayName = accounts[0]?.name || accounts[0]?.username || "User"
  const email = accounts[0]?.username || ""
  const isCollapsed = state === "collapsed"

  return (
    <>
      <UISidebar collapsible="icon" className="border-r border-sidebar-border">
        <SidebarHeader className="px-1 pt-5">
          {!isCollapsed && (
            <button
              type="button"
              onClick={() => router.push("/")}
              className="flex w-full items-center justify-start rounded-lg px-3 pb-0 text-left text-base font-semibold text-sidebar-foreground transition hover:bg-sidebar-accent group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
            >
              <div className="flex w-full items-center justify-start rounded-lg px-0 group-data-[collapsible=icon]:justify-center">
                <img src="/ukg-logo.png" alt="UKG Logo" className="h-12 w-auto" />
              </div>
            </button>
          )}
        </SidebarHeader>

        <SidebarContent className="pt-0">
          <SidebarGroup>
            <SidebarGroupLabel>Main Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => {
                  const active = isActive(item.path)
                  const Icon = iconMap[item.icon]
                  return (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        className={cn(
                          "group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0",
                          active &&
                          "bg-[#E5FF1F] text-gray-900 hover:bg-[#d4e514]",
                        )}
                      >
                        <Link href={item.path}>
                          <Icon
                            className={cn(
                              "text-sidebar-foreground",
                              active && "text-gray-900",
                            )}
                          />
                          <span className={active ? "font-semibold" : ""}>
                            {item.label}
                          </span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarSeparator />

        <SidebarFooter className="mt-auto pb-4">
          {isCollapsed ? (
            <button
              type="button"
              onClick={handleLogout}
              className="mx-auto flex size-10 items-center justify-center rounded-full bg-sidebar-accent text-sidebar-foreground transition hover:bg-sidebar-accent/70"
              aria-label="Logout"
            >
              <LogOut className="size-5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center justify-between rounded-lg border border-transparent bg-sidebar-accent px-3 py-2 text-left transition hover:border-sidebar-border hover:bg-sidebar-accent/70"
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <div className="flex size-10 flex-shrink-0 items-center justify-center rounded-full bg-[#E5FF1F] text-base font-semibold text-gray-900 shadow-sm">
                  {userInitial}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-sidebar-foreground">
                    {displayName}
                  </p>
                  {email && (
                    <p className="truncate text-xs text-sidebar-foreground/70">
                      {email}
                    </p>
                  )}
                </div>
              </div>
              <LogOut className="size-4 text-sidebar-foreground/60" />
            </button>
          )}
        </SidebarFooter>
      </UISidebar>
      <SidebarRail className="border-sidebar-border" />
    </>
  )
}
