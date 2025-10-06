import * as React from "react";
import {
  IconBrandTelegram,
  IconCashBanknote,
  IconCoin,
  IconCreditCard,
  IconDashboard,
  IconHelp,
  IconSearch,
  IconSettings,
  IconWallet,
} from "@tabler/icons-react";

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
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth";

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
      icon: IconDashboard,
      addButton: false,
    },
    {
      title: "Topups",
      url: "/top-ups",
      icon: IconCoin,
      addButton: true,
    },
    {
      title: "Bank Accounts",
      url: "/bank-accounts",
      icon: IconCashBanknote,
      addButton: true,
    },
    {
      title: "Wallets",
      url: "/wallets",
      icon: IconWallet,
      addButton: false,
    },
    {
      title: "Payments",
      url: "/payments",
      icon: IconCreditCard,
      addButton: false,
    },
  ],

  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: IconSettings,
    },
    {
      title: "Get Help",
      url: "#",
      icon: IconHelp,
    },
    {
      title: "Search",
      url: "#",
      icon: IconSearch,
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
    <Sidebar collapsible="offcanvas" {...props}>
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
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <a
                href="https://t.me/multipayz"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <IconBrandTelegram className="w-4 h-4" />
                <span>@multipayz</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  );
}
