"use client";

import * as React from "react";
import {
  AudioWaveform,
  Command,
  Frame,
  FilesIcon,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
  Users,
  FileTextIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { NavMain } from "@/components/sidebar/nav-main";
import { NavUser } from "@/components/sidebar/nav-user";
import { TeamSwitcher } from "@/components/sidebar/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

// This is sample data.
const generateNavItems = (t: (key: string) => string) => [
  {
    title: t("Navigation.files"),
    url: "/dashboard/files",
    icon: FilesIcon,
    isActive: true,
    items: [
      {
        title: t("Dashboard.files.title"),
        url: "/dashboard/files?sort=all",
      },
      {
        title: t("Dashboard.files.recent"),
        url: "/dashboard/files?sort=recent",
      },
      {
        title: t("Dashboard.files.starred"),
        url: "/dashboard/files?sort=starred",
      },
    ],
  },
  {
    title: t("Navigation.team"),
    url: "/dashboard/team",
    icon: Users,
    items: [
      {
        title: t("Dashboard.team.title"),
        url: "/dashboard/team",
      },
      {
        title: t("Dashboard.team.permissionsNav"),
        url: "/dashboard/team/permissions",
      },
      {
        title: t("Dashboard.team.invites"),
        url: "/dashboard/team/invites",
      },
    ],
  },
  {
    title: t("Navigation.documents"),
    url: "/dashboard/documents",
    icon: FileTextIcon,
    items: [
      {
        title: t("Dashboard.documents.title"),
        url: "/dashboard/documents",
      },
      {
        title: t("Dashboard.documents.shared"),
        url: "/dashboard/documents/shared",
      },
      {
        title: t("Dashboard.documents.archived"),
        url: "/dashboard/documents/archived",
      },
    ],
  },
  {
    title: t("Navigation.settings"),
    url: "/dashboard/settings",
    icon: Settings2,
    items: [
      {
        title: t("Dashboard.settings.general"),
        url: "/dashboard/settings",
      },
      {
        title: t("Dashboard.settings.team"),
        url: "/dashboard/settings/team",
      },
      {
        title: t("Dashboard.settings.billing"),
        url: "/dashboard/settings/billing",
      },
      {
        title: t("Dashboard.settings.api"),
        url: "/dashboard/settings/api",
      },
    ],
  },
];

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const t = useTranslations();
  const navMain = generateNavItems(t);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter className="flex flex-col gap-4">
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
