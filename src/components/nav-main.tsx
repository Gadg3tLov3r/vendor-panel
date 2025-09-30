import { IconPlus, type Icon } from "@tabler/icons-react";
import { Link, useLocation } from "react-router";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from "./ui/button";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: Icon;
    addButton?: boolean;
  }[];
}) {
  const location = useLocation();

  // Generate create URL based on the item URL
  const getCreateUrl = (url: string) => {
    return `${url}/create`;
  };

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem
              className="flex items-center gap-2"
              key={item.title}
            >
              <SidebarMenuButton
                tooltip={item.title}
                asChild
                isActive={location.pathname === item.url}
              >
                <Link to={item.url}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
              {item.addButton && (
                <Button
                  size="icon"
                  className="size-8 group-data-[collapsible=icon]:opacity-0"
                  variant="ghost"
                  asChild
                  title={`Create ${item.title.slice(0, -1)}`} // Remove 's' from title for singular form
                >
                  <Link to={getCreateUrl(item.url)}>
                    <IconPlus />
                    <span className="sr-only">
                      Add {item.title.slice(0, -1)}
                    </span>
                  </Link>
                </Button>
              )}
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
