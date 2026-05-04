import { NavLink, useLocation } from "react-router-dom"
import { Users, FileText, LayoutDashboard, ChevronRight, UserCircle, Settings, LogOut, Target } from "lucide-react"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"

const navItems = [
  { to: "/", label: "Overview", icon: LayoutDashboard },
  { to: "/candidates", label: "Candidates", icon: Users },
  { to: "/applications", label: "Applications", icon: FileText },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation()

  const isActiveRoute = (path: string) => {
    if (path === "/") return location.pathname === "/"
    return location.pathname.startsWith(path)
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-slate-50/40">
        {/* Sidebar */}
        <Sidebar variant="inset" collapsible="icon">
          {/* Header */}
          <SidebarHeader className="h-16 flex items-center px-4 border-b">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 flex items-center justify-center rounded-lg bg-linear-to-br from-blue-600 to-blue-500 text-white shadow-md">
                <Target className="h-5 w-5" />
              </div>
              <div className="group-data-[collapsible=icon]:hidden leading-tight">
                <h1 className="font-bold text-lg tracking-tight">
                  App <span className="text-blue-600">RS</span>
                </h1>
                <p className="text-xs text-slate-400">Recruitment System</p>
              </div>
            </div>
          </SidebarHeader>
          {/* Nav */}
          <SidebarContent className="px-2 py-3">
            <SidebarMenu className="space-y-1">
              {navItems.map((item) => {
                const active = isActiveRoute(item.to)
                return (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={item.label}
                      className={`
                        h-11 rounded-lg transition-all
                        ${active
                          ? "bg-white shadow-sm text-blue-600 ring-1 ring-slate-200"
                          : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                        }
                      `}
                    >
                      <NavLink to={item.to} end>
                        <item.icon className="h-5 w-5" />
                        <span className="font-medium">
                          {item.label}
                        </span>
                        {active && (
                          <ChevronRight className="ml-auto h-4 w-4 opacity-60" />
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarContent>
          {/* Footer */}
          <SidebarFooter className="p-4 border-t">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="h-12 rounded-xl hover:bg-slate-100">
                  <div className="h-9 w-9 rounded-full bg-slate-200 flex items-center justify-center">
                    <UserCircle className="h-5 w-5 text-slate-500" />
                  </div>
                  <div className="flex flex-col items-start text-sm group-data-[collapsible=icon]:hidden">
                    <span className="font-semibold text-slate-700">
                      Ibrahim Dayoub
                    </span>
                    <span className="text-xs text-slate-400">
                      Software Engineer
                    </span>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="right" align="end" className="w-56">
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-600 focus:text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>
        {/* Content */}
        <SidebarInset className="flex flex-col">
          <header className="flex h-16 items-center gap-2 border-b px-6 bg-white/80 backdrop-blur-md sticky top-0 z-10">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="h-4" />
            <div className="flex-1">
              <h2 className="text-sm font-medium text-slate-600">
                {navItems.find(i => isActiveRoute(i.to))?.label || "Page"}
              </h2>
            </div>
          </header>
          <main className="flex-1 p-6 md:p-8 max-w-400 mx-auto w-full">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}