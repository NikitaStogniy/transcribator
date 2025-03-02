"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { usePermissions } from "@/hooks/usePermissions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { IndeterminateCheckbox } from "@/components/ui/indeterminate-checkbox";
import { toast } from "sonner";
import { Permission } from "@/app/api/permissions/route";

export default function PermissionsPage() {
  const t = useTranslations("Dashboard.team.permissions");
  const {
    permissions,
    roles,
    isLoading,
    useRolePermissions,
    updateRolePermissions,
  } = usePermissions();
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const { data: roleData, isLoading: isRoleLoading } =
    useRolePermissions(selectedRoleId);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Group permissions by module
  const permissionsByModule = permissions.reduce<Record<string, Permission[]>>(
    (acc, permission) => {
      if (!acc[permission.module]) {
        acc[permission.module] = [];
      }
      acc[permission.module].push(permission);
      return acc;
    },
    {}
  );

  // Handle role selection
  const handleRoleSelect = (roleId: string) => {
    setSelectedRoleId(roleId);
  };

  // Handle permission toggle
  const handlePermissionToggle = (permissionId: string) => {
    setSelectedPermissions((prev) => {
      if (prev.includes(permissionId)) {
        return prev.filter((id) => id !== permissionId);
      } else {
        return [...prev, permissionId];
      }
    });
  };

  // Handle module toggle (toggle all permissions in a module)
  const handleModuleToggle = (modulePermissions: Permission[]) => {
    const modulePermissionIds = modulePermissions.map((p) => p.id);
    const allSelected = modulePermissions.every((p) =>
      selectedPermissions.includes(p.id)
    );

    if (allSelected) {
      // Remove all module permissions
      setSelectedPermissions((prev) =>
        prev.filter((id) => !modulePermissionIds.includes(id))
      );
    } else {
      // Add all module permissions that aren't already selected
      setSelectedPermissions((prev) => {
        const newPermissions = modulePermissionIds.filter(
          (id) => !prev.includes(id)
        );
        return [...prev, ...newPermissions];
      });
    }
  };

  // Handle save permissions
  const handleSavePermissions = async () => {
    if (!selectedRoleId) return;

    setIsSaving(true);
    try {
      await updateRolePermissions.mutateAsync({
        roleId: selectedRoleId,
        permissionIds: selectedPermissions,
      });
    } catch (error) {
      console.error("Failed to update permissions:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Initialize selected permissions when role data changes
  useState(() => {
    if (roleData) {
      setSelectedPermissions(roleData.permissions.map((p) => p.id));
    }
  });

  // Update selected permissions when role data changes
  if (roleData && selectedPermissions.length === 0) {
    setSelectedPermissions(roleData.permissions.map((p) => p.id));
  }

  return (
    <div className="container w-full space-y-6 p-4">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>

      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Roles sidebar */}
        <div className="md:col-span-3 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("roleTitle")}</CardTitle>
              <CardDescription>{t("roleDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-2">
                {isLoading ? (
                  <>
                    <div className="p-4 border-t">
                      <Skeleton className="h-6 w-full" />
                    </div>
                    <div className="p-4 border-t">
                      <Skeleton className="h-6 w-full" />
                    </div>
                    <div className="p-4 border-t">
                      <Skeleton className="h-6 w-full" />
                    </div>
                  </>
                ) : (
                  roles.map((role) => (
                    <div
                      key={role.id}
                      className={`p-4 border-t cursor-pointer hover:bg-muted/50 transition-colors ${
                        role.id === selectedRoleId ? "bg-muted" : ""
                      }`}
                      onClick={() => handleRoleSelect(role.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{role.name}</div>
                        <Badge variant="outline">
                          {role.permissions.length}{" "}
                          {t("permissionsTitle").toLowerCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {role.description}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Permissions content */}
        <div className="md:col-span-9">
          <Card>
            <CardHeader>
              <CardTitle>{t("permissionsTitle")}</CardTitle>
              <CardDescription>
                {!selectedRoleId
                  ? t("selectRole")
                  : isRoleLoading
                  ? t("loading")
                  : `${t("permissionsTitle")} for ${roleData?.name}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedRoleId ? (
                <div className="flex justify-center items-center h-64 text-muted-foreground">
                  {t("selectRole")}
                </div>
              ) : isRoleLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              ) : (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium">{t("modulesTitle")}</h3>

                  {Object.entries(permissionsByModule).map(
                    ([module, modulePermissions]) => {
                      const allModuleSelected = modulePermissions.every((p) =>
                        selectedPermissions.includes(p.id)
                      );
                      const someModuleSelected = modulePermissions.some((p) =>
                        selectedPermissions.includes(p.id)
                      );

                      return (
                        <div key={module} className="border rounded-md">
                          <div
                            className="p-4 font-medium bg-muted/50 border-b flex items-center space-x-2 cursor-pointer"
                            onClick={() =>
                              handleModuleToggle(modulePermissions)
                            }
                          >
                            <IndeterminateCheckbox
                              id={`module-${module}`}
                              checked={allModuleSelected}
                              indeterminate={
                                !allModuleSelected && someModuleSelected
                              }
                              onCheckedChange={() =>
                                handleModuleToggle(modulePermissions)
                              }
                            />
                            <label
                              htmlFor={`module-${module}`}
                              className="cursor-pointer flex-1"
                            >
                              {t(module.toLowerCase())}
                            </label>
                          </div>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-[50px]"></TableHead>
                                <TableHead>{t("name")}</TableHead>
                                <TableHead>{t("description")}</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {modulePermissions.map((permission) => (
                                <TableRow key={permission.id}>
                                  <TableCell>
                                    <Checkbox
                                      id={`permission-${permission.id}`}
                                      checked={selectedPermissions.includes(
                                        permission.id
                                      )}
                                      onCheckedChange={() =>
                                        handlePermissionToggle(permission.id)
                                      }
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <label
                                      htmlFor={`permission-${permission.id}`}
                                      className="font-medium cursor-pointer"
                                    >
                                      {permission.name}
                                    </label>
                                  </TableCell>
                                  <TableCell>
                                    {permission.description}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      );
                    }
                  )}

                  <div className="flex justify-end mt-6">
                    <Button
                      onClick={handleSavePermissions}
                      disabled={isSaving || !selectedRoleId}
                    >
                      {isSaving ? t("loading") : t("saveChanges")}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
