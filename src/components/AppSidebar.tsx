import { NavLink, useLocation } from "react-router-dom";
import { AudioWaveform, Mic, GraduationCap } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
  {
    title: "Voice Accent Generator",
    url: "/",
    icon: AudioWaveform,
  },
  {
    title: "Voice Model Training",
    url: "/training",
    icon: GraduationCap,
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const isCollapsed = state === "collapsed";
  const isTrainingPage = currentPath === '/training';

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? `font-medium border-r-2 ${
          isTrainingPage 
            ? 'bg-training-primary/10 text-training-primary border-training-primary' 
            : 'bg-primary/10 text-primary border-primary'
        }`
      : "hover:bg-muted/50";

  return (
    <Sidebar
      className={`${isCollapsed ? "w-14" : "w-64"} ${
        isTrainingPage 
          ? 'border-training-primary/20 bg-training-primary/5' 
          : 'border-border bg-sidebar'
      }`}
      collapsible="icon"
    >
      <SidebarHeader className={`border-b p-4 ${
        isTrainingPage ? 'border-training-primary/20' : 'border-border'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
            isTrainingPage 
              ? 'bg-gradient-to-br from-training-primary to-training-accent' 
              : 'bg-gradient-to-br from-primary to-accent'
          }`}>
            <AudioWaveform className="h-5 w-5 text-white" />
          </div>
          {!isCollapsed && (
            <div>
              <h2 className={`font-semibold text-lg ${
                isTrainingPage ? 'text-training-primary' : 'text-primary'
              }`}>AI Voice Studio</h2>
              <p className="text-xs text-muted-foreground">Transform your voice</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Features</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}