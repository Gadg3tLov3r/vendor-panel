import * as React from "react";
import {
  Banknote,
  Bolt,
  Coins,
  CreditCard,
  File,
  LayoutDashboard,
  Wallet,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth";

// This is sample data.
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
      icon: LayoutDashboard,
      addButton: false,
    },
    {
      title: "Topups",
      url: "/top-ups",
      icon: Coins,
      addButton: true,
    },
    {
      title: "Bank Accounts",
      url: "/bank-accounts",
      icon: Banknote,
      addButton: true,
    },
    {
      title: "Wallets",
      url: "/wallets",
      icon: Wallet,
      addButton: false,
    },
    {
      title: "Payments",
      url: "/payments",
      icon: CreditCard,
      addButton: false,
    },
    {
      title: "Bank Accounts Reports",
      url: "/bank-accounts/reports",
      icon: File,
      addButton: false,
    },
    {
      title: "Fast Deposit",
      url: "/fast-deposit",
      icon: Bolt,
      addButton: false,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth();

  // Create user object for NavUser component
  const userData = {
    name: user?.username || "User",
    email: user?.principal || "vendor",
    avatar: "/avatars/default.jpg", // You can add a default avatar or use user avatar if available
  };
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <img
                  src="/logo-sidebar.png"
                  alt="Multipayz"
                  className="h-8 w-auto"
                />
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
