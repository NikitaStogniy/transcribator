import { useSelectedTeam } from "./use-selected-team";

/**
 * Hook to access the currently selected team.
 * @returns An object containing the selectedTeamId.
 */
export function useTeamSelection() {
  const { data: selectedTeamId } = useSelectedTeam();

  return {
    selectedTeamId,
  };
}
