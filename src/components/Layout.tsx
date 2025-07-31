import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { TrainingJobList } from "@/components/TrainingJobList";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-12 flex items-center justify-between border-b border-border bg-card px-4">
            <div className="flex items-center">
              <SidebarTrigger className="mr-2" />
              <h1 className="text-sm font-medium text-muted-foreground">
                AI Voice Processing Platform
              </h1>
            </div>
            <TrainingJobList />
          </header>
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};