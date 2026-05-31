"use client";

import * as React from "react";
import { Switch } from "../ui/switch";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Moon, Sun, UserPlus } from "lucide-react";
import CreateNewChat from "../chat/CreateNewChat";
import NewGroupChatModal from "../chat/NewGroupChatModal";
import GroupChatList from "../chat/GroupChatList";
import { Link } from "react-router";
import { useThemeStore } from "@/stores/useThemeStore";
import DirectChatList from "../chat/DirectChatList";
import { useAuthStore } from "@/stores/useAuthStore";
import { NavUser } from "./nav-user";
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { isDark, toggleTheme } = useThemeStore();
  const { user } = useAuthStore();
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              className="bg-gradient-primary"
            >
              <a href="#">
                <div className="flex w-full items-center px-2 justify-between">
                  <h1 className="text-xl font-bold text-white">AloHub</h1>
                  <div className="flex items-center gap-2">
                    <Sun className="size-4 text-white/80" />
                    <Switch
                      checked={isDark}
                      onCheckedChange={toggleTheme}
                      className="data-[state=checked]:bg-background/80"
                    />
                    <Moon className="size-4 text-white/80" />
                  </div>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="beautiful-scrollbar">
        {/* New Chat */}
        <SidebarGroup />
        <SidebarGroupContent>
          <CreateNewChat />
        </SidebarGroupContent>
        <SidebarGroup />
        {/* Group chat */}
        <SidebarGroup>
          <SidebarGroupLabel className="font-bold tracking-wide text-foreground">
           Nhóm chat
          </SidebarGroupLabel>{" "}
          <SidebarGroupAction title="Tạo nhóm" className="cursor-pointer">
            <NewGroupChatModal />
          </SidebarGroupAction>
          <SidebarGroupContent>
            <GroupChatList />
          </SidebarGroupContent>
        </SidebarGroup>
        {/* Friend chat */}
        <SidebarGroup>
          <SidebarGroupLabel className="font-bold tracking-wide text-foreground">
            Bạn bè
          </SidebarGroupLabel>
          <SidebarGroupAction title="Kết bạn" className="cursor-pointer">
            <Link to="/friend-suggest" className="flex items-center gap-2">
              <UserPlus className="size-6" />
            </Link>
          </SidebarGroupAction>
          <SidebarGroupContent>
            <DirectChatList />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>{user && <NavUser user={user} />}</SidebarFooter>
    </Sidebar>
  );
}
