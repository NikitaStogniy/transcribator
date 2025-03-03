import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSelectedTeam } from "./use-selected-team";
import { get, post, del, patch } from "@/lib/fetch-client";
import { TeamRole } from "./use-team";

// Types for team invites
export type InviteStatus = "pending" | "accepted" | "expired";

export interface TeamInvite {
  id: string;
  teamId: string;
  email: string;
  role: TeamRole;
  status: InviteStatus;
  expiresAt: string;
  createdAt: string;
}

export interface CreateInvitePayload {
  teamId: string;
  email: string;
  role: TeamRole;
}

export interface CreateInviteResponse {
  invite: TeamInvite;
  inviteLink: string;
}

// Fetch team invites
const fetchTeamInvites = async (teamId?: string): Promise<TeamInvite[]> => {
  if (!teamId || teamId === "" || teamId === "default") {
    console.log("Skipping team invites fetch - invalid teamId:", teamId);
    return [];
  }

  try {
    return await get<TeamInvite[]>("/api/team/invites", { teamId });
  } catch (error) {
    console.error("Error fetching team invites:", error);
    return [];
  }
};

// Create team invite
const createTeamInvite = async (
  data: CreateInvitePayload
): Promise<CreateInviteResponse> => {
  return await post<CreateInviteResponse>("/api/team/invites", data);
};

// Delete team invite
const deleteTeamInvite = async (id: string): Promise<{ success: boolean }> => {
  return await del<{ success: boolean }>("/api/team/invites", {
    params: { id },
  });
};

// Resend team invite
const resendTeamInvite = async (id: string): Promise<CreateInviteResponse> => {
  return await patch<CreateInviteResponse>("/api/team/invites", { id });
};

// Hook for fetching team invites
export function useTeamInvites() {
  const { data: selectedTeamId } = useSelectedTeam();

  return useQuery({
    queryKey: ["team-invites", selectedTeamId],
    queryFn: () => fetchTeamInvites(selectedTeamId),
    enabled: !!selectedTeamId && selectedTeamId !== "",
  });
}

// Hook for creating team invite
export function useCreateTeamInvite() {
  const queryClient = useQueryClient();
  const { data: selectedTeamId } = useSelectedTeam();

  return useMutation({
    mutationFn: createTeamInvite,
    onSuccess: () => {
      if (selectedTeamId && selectedTeamId !== "") {
        queryClient.invalidateQueries({
          queryKey: ["team-invites", selectedTeamId],
        });
      }
    },
  });
}

// Hook for deleting team invite
export function useDeleteTeamInvite() {
  const queryClient = useQueryClient();
  const { data: selectedTeamId } = useSelectedTeam();

  return useMutation({
    mutationFn: deleteTeamInvite,
    onSuccess: () => {
      if (selectedTeamId && selectedTeamId !== "") {
        queryClient.invalidateQueries({
          queryKey: ["team-invites", selectedTeamId],
        });
      }
    },
  });
}

// Hook for resending team invite
export function useResendTeamInvite() {
  const queryClient = useQueryClient();
  const { data: selectedTeamId } = useSelectedTeam();

  return useMutation({
    mutationFn: resendTeamInvite,
    onSuccess: () => {
      if (selectedTeamId && selectedTeamId !== "") {
        queryClient.invalidateQueries({
          queryKey: ["team-invites", selectedTeamId],
        });
      }
    },
  });
}

// Hook for filtering invites by status
export function useTeamInvitesByStatus() {
  const { data: invites = [] } = useTeamInvites();

  const invitesByStatus = {
    pending: invites.filter((invite) => invite.status === "pending"),
    accepted: invites.filter((invite) => invite.status === "accepted"),
    expired: invites.filter((invite) => invite.status === "expired"),
    all: invites,
  };

  return invitesByStatus;
}
