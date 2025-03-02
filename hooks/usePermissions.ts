import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Permission, RolePermission } from "@/app/api/permissions/route";
import { toast } from "sonner";

interface PermissionsResponse {
  permissions: Permission[];
  roles: RolePermission[];
}

interface UpdateRolePermissionsParams {
  roleId: string;
  permissionIds: string[];
}

export function usePermissions() {
  const queryClient = useQueryClient();

  // Fetch all permissions and roles
  const { data, isLoading, error } = useQuery<PermissionsResponse>({
    queryKey: ["permissions"],
    queryFn: async () => {
      const response = await fetch("/api/permissions");
      if (!response.ok) {
        throw new Error("Failed to fetch permissions");
      }
      return response.json();
    },
  });

  // Fetch role details with specific permissions
  const fetchRolePermissions = async (
    roleId: string
  ): Promise<RolePermission> => {
    const response = await fetch(`/api/permissions?roleId=${roleId}`);
    if (!response.ok) {
      throw new Error("Failed to fetch role permissions");
    }
    return response.json();
  };

  // Get role details by ID
  const useRolePermissions = (roleId: string | null) => {
    return useQuery<RolePermission>({
      queryKey: ["permissions", "role", roleId],
      queryFn: async () => {
        if (!roleId) {
          throw new Error("Role ID is required");
        }
        return fetchRolePermissions(roleId);
      },
      enabled: !!roleId,
    });
  };

  // Update role permissions
  const updateRolePermissions = useMutation({
    mutationFn: async (params: UpdateRolePermissionsParams) => {
      const response = await fetch("/api/permissions", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error("Failed to update role permissions");
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
      queryClient.invalidateQueries({
        queryKey: ["permissions", "role", variables.roleId],
      });
      toast.success("Permissions updated successfully");
    },
    onError: (error) => {
      toast.error(`Error updating permissions: ${error.message}`);
    },
  });

  return {
    permissions: data?.permissions || [],
    roles: data?.roles || [],
    isLoading,
    error,
    useRolePermissions,
    updateRolePermissions,
  };
}
