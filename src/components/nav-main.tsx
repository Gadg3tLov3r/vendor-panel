"use client";

import { PlusCircle, type LucideIcon } from "lucide-react";

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    addButton?: boolean;
    icon?: LucideIcon;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}) {
  const { isMobile, state } = useSidebar();
  const location = useLocation();

  const getCreateUrl = (url: string) => {
    return `${url}/create`;
  };

  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem className="flex items-center gap-2">
            <SidebarMenuButton
              isActive={location.pathname === item.url}
              tooltip="Quick Create"
              asChild
            >
              <Link to={item.url}>
                {item.icon && <item.icon />}
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
            {item.addButton && (
              <Button
                size="icon"
                className={cn(
                  "size-8 group-data-[collapsible=icon]:opacity-0",
                  (state === "collapsed" || isMobile) && "hidden"
                )}
                variant="ghost"
                asChild
              >
                <Link to={getCreateUrl(item.url)}>
                  <PlusCircle />
                  <span className="sr-only">Add</span>
                </Link>
              </Button>
            )}
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
