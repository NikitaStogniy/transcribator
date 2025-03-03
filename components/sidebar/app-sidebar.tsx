"use client";

import * as React from "react";
import {
  AudioWaveform,
  Command,
  FilesIcon,
  GalleryVerticalEnd,
  Settings2,
  Users,
  FileTextIcon,
  Building2,
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
import { useTeam } from "@/hooks/use-team";
import { useSession } from "@/hooks/use-session";

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
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const t = useTranslations();
  const navMain = generateNavItems(t);
  const { data: teamData } = useTeam();
  const { data: sessionData, isLoading } = useSession();

  // Transform the team data to include logos and plans
  const teams = React.useMemo(() => {
    // Если данные о команде недоступны или нет объекта team,
    // возвращаем массив с дефолтной командой
    if (!teamData?.team) {
      return [
        {
          id: "default",
          name: "Моя команда",
          logo: Building2,
          plan: "Бесплатно",
        },
      ];
    }

    // Create a team entry with the current team
    const currentTeam = {
      id: teamData.team.id,
      name: teamData.team.name,
      logo: Building2,
      plan: "Team", // Default plan if not available
    };

    return [currentTeam];
  }, [teamData]);

  if (isLoading) {
    return null; // or a loading spinner
  }

  if (!sessionData?.authenticated) {
    return null; // or redirect to login
  }

  const user = {
    name: sessionData.userName || "Guest",
    email: sessionData.userEmail || "",
    avatar: "", // You might want to add avatar to your session data
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter className="flex flex-col gap-4">
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
