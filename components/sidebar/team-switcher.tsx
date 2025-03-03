"use client";

import * as React from "react";
import { Building2, ChevronsUpDown, Plus } from "lucide-react";
import { useTranslations } from "next-intl";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useTeam, type Team } from "@/hooks/use-team";
import { useSelectedTeam, useSetSelectedTeam } from "@/hooks/use-selected-team";

interface TeamWithDisplay extends Team {
  logo: React.ElementType;
  plan: string;
}

// Visual fallback only - never used for API requests
const DEFAULT_DISPLAY = {
  name: "My Team",
  logo: Building2,
  plan: "Loading...",
};

export function TeamSwitcher({
  teams,
}: {
  teams: {
    id: string;
    name: string;
    logo: React.ElementType;
    plan: string;
  }[];
}) {
  const t = useTranslations("Dashboard.team.switcher");
  const { isMobile } = useSidebar();
  const { data: selectedTeamId } = useSelectedTeam();
  const setSelectedTeam = useSetSelectedTeam();
  const { data: teamData } = useTeam();

  // Effect to set a valid team if the current selection doesn't exist
  React.useEffect(() => {
    if (teams && teams.length > 0) {
      // If no team is selected or the selected team doesn't exist in the list,
      // select the first team
      if (
        !selectedTeamId ||
        !teams.some((team) => team.id === selectedTeamId)
      ) {
        setSelectedTeam(teams[0].id);
      }
    }
  }, [teams, selectedTeamId, setSelectedTeam]);

  // Find the currently active team for display purposes only
  const activeTeam = React.useMemo(() => {
    // If teams array is empty, don't return any team object with an ID
    if (!teams || teams.length === 0) {
      // Return only visual properties, no ID that could be used for API calls
      return DEFAULT_DISPLAY;
    }

    // Find the selected team
    const selected = teams.find((team) => team.id === selectedTeamId);
    if (selected) {
      return selected;
    }

    // If selected team doesn't exist but we have teams, return the first one
    if (teams.length > 0) {
      return teams[0];
    }

    // Ultimate fallback (should never happen due to the useEffect above)
    return DEFAULT_DISPLAY;
  }, [teams, selectedTeamId]);

  const handleTeamSelect = (team: (typeof teams)[0]) => {
    setSelectedTeam(team.id);
  };

  // Check if we have a valid team selection
  const hasValidTeam =
    teams &&
    teams.length > 0 &&
    selectedTeamId &&
    teams.some((team) => team.id === selectedTeamId);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                {activeTeam.logo ? (
                  <activeTeam.logo className="size-4" />
                ) : (
                  <Building2 className="size-4" />
                )}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {activeTeam.name}
                </span>
                <span className="truncate text-xs">{activeTeam.plan}</span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              {t("teams")}
            </DropdownMenuLabel>
            {teams && teams.length > 0 ? (
              teams.map((team, index) => (
                <DropdownMenuItem
                  key={team.id}
                  onClick={() => handleTeamSelect(team)}
                  className="gap-2 p-2"
                >
                  <div className="flex size-6 items-center justify-center rounded-sm border">
                    <team.logo className="size-4 shrink-0" />
                  </div>
                  {team.name}
                  <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                </DropdownMenuItem>
              ))
            ) : (
              <DropdownMenuItem disabled className="gap-2 p-2 opacity-50">
                <div className="flex size-6 items-center justify-center rounded-sm border">
                  <Building2 className="size-4 shrink-0" />
                </div>
                {t("loadingTeams")}
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled className="gap-2 p-2">
              <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                <Plus className="size-4" />
              </div>
              <div className="font-medium text-muted-foreground">
                {t("addTeam")}
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
