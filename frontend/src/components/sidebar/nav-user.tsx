"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import type { User } from "@/types/user";
import { ChevronsUpDownIcon, UserIcon, Bell, Users } from "lucide-react";
import Logout from "../auth/Logout";
import { Link } from "react-router";
import { useNotificationStore } from "@/stores/useNotificationStore";
import { useFriendStore } from "@/stores/useFriendStore";
import { useEffect } from "react";

export function NavUser({ user }: { user: User }) {
  const { isMobile } = useSidebar();
  const { unreadCount, fetchNotifications } = useNotificationStore();
  const { receivedRequests, fetchRequests } = useFriendStore();

  useEffect(() => {
    fetchRequests();
    fetchNotifications();
  }, []);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg relative">
                <AvatarImage src={user.avatarUrl} />
                <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                {(unreadCount > 0 || receivedRequests.length > 0) && (
                  <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border border-white" />
                )}
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.displayName}</span>
                <span className="truncate text-xs">{user.username}</span>
              </div>
              <ChevronsUpDownIcon className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatarUrl} alt={user.username} />
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {user.displayName}
                  </span>
                  <span className="truncate text-xs">{user.username}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem className="p-0">
                <Link to="/tai-khoan" className="flex w-full items-center gap-2 px-2 py-1.5">
                  <UserIcon className="size-4 text-muted-foreground" />
                  <span>Tài Khoản</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="p-0">
                <Link to="/ban-be" className="flex w-full items-center gap-2 px-2 py-1.5">
                  <Users className="size-4 text-muted-foreground" />
                  <span>Bạn bè</span>
                  {receivedRequests.length > 0 && (
                    <span className="ml-auto bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {receivedRequests.length}
                    </span>
                  )}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="p-0">
                <Link to="/thong-bao" className="flex w-full items-center gap-2 px-2 py-1.5">
                  <Bell className="size-4 text-muted-foreground" />
                  <span>Thông Báo</span>
                  {unreadCount > 0 && (
                    <span className="ml-auto bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer" variant="destructive">
              <Logout />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
