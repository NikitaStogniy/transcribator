import { NextResponse } from "next/server";

// Define permission types
export type Permission = {
  id: string;
  name: string;
  description: string;
  module: string;
};

export type RolePermission = {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
};

// Mock permissions data
const permissions: Permission[] = [
  {
    id: "1",
    name: "view_files",
    description: "View files in the system",
    module: "files",
  },
  {
    id: "2",
    name: "upload_files",
    description: "Upload new files to the system",
    module: "files",
  },
  {
    id: "3",
    name: "delete_files",
    description: "Delete files from the system",
    module: "files",
  },
  {
    id: "4",
    name: "view_documents",
    description: "View documents in the system",
    module: "documents",
  },
  {
    id: "5",
    name: "create_documents",
    description: "Create new documents",
    module: "documents",
  },
  {
    id: "6",
    name: "edit_documents",
    description: "Edit existing documents",
    module: "documents",
  },
  {
    id: "7",
    name: "delete_documents",
    description: "Delete documents from the system",
    module: "documents",
  },
  {
    id: "8",
    name: "manage_team",
    description: "Manage team members",
    module: "team",
  },
  {
    id: "9",
    name: "manage_permissions",
    description: "Manage role permissions",
    module: "team",
  },
];

// Mock roles with permissions
const roles: RolePermission[] = [
  {
    id: "1",
    name: "Admin",
    description: "Full access to all system features",
    permissions: permissions,
  },
  {
    id: "2",
    name: "Editor",
    description: "Can edit content but cannot manage team",
    permissions: permissions.filter(
      (p) => p.module !== "team" || p.name === "view_team_members"
    ),
  },
  {
    id: "3",
    name: "Viewer",
    description: "Can only view content",
    permissions: permissions.filter((p) => p.name.startsWith("view_")),
  },
];

// GET handler for fetching all permissions
export async function GET(request: Request) {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const { searchParams } = new URL(request.url);
  const roleId = searchParams.get("roleId");

  if (roleId) {
    const role = roles.find((r) => r.id === roleId);
    if (!role) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }
    return NextResponse.json(role);
  }

  return NextResponse.json({
    permissions,
    roles,
  });
}

// PATCH handler for updating role permissions
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { roleId, permissionIds } = body;

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Find the role
    const roleIndex = roles.findIndex((r) => r.id === roleId);
    if (roleIndex === -1) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    // Update permissions
    const updatedPermissions = permissions.filter((p) =>
      permissionIds.includes(p.id)
    );

    // Update the role
    roles[roleIndex] = {
      ...roles[roleIndex],
      permissions: updatedPermissions,
    };

    return NextResponse.json(roles[roleIndex]);
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
