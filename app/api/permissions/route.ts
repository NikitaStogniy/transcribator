import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

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

// Validation schema for updating role permissions
const updateRolePermissionsSchema = z.object({
  roleId: z.string(),
  permissionIds: z.array(z.string()),
});

// GET handler for fetching all permissions
export async function GET(request: Request) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const roleId = searchParams.get("roleId");

    if (roleId) {
      // Get specific role with its permissions
      const role = await prisma.role.findUnique({
        where: {
          id: roleId,
        },
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      });

      if (!role) {
        return NextResponse.json({ error: "Role not found" }, { status: 404 });
      }

      // Format the response
      return NextResponse.json({
        id: role.id,
        name: role.name,
        description: role.description,
        permissions: role.permissions.map((rp: any) => ({
          id: rp.permission.id,
          name: rp.permission.name,
          description: rp.permission.description,
          module: rp.permission.module,
        })),
      });
    }

    // Get all permissions and roles
    const [permissions, roles] = await Promise.all([
      prisma.permission.findMany(),
      prisma.role.findMany({
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      }),
    ]);

    // Format the roles response
    const formattedRoles = roles.map((role: any) => ({
      id: role.id,
      name: role.name,
      description: role.description,
      permissions: role.permissions.map((rp: any) => ({
        id: rp.permission.id,
        name: rp.permission.name,
        description: rp.permission.description,
        module: rp.permission.module,
      })),
    }));

    return NextResponse.json({
      permissions,
      roles: formattedRoles,
    });
  } catch (error) {
    console.error("Error fetching permissions:", error);
    return NextResponse.json(
      { error: "Failed to fetch permissions" },
      { status: 500 }
    );
  }
}

// PATCH handler for updating role permissions
export async function PATCH(request: Request) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();

    // Validate input
    const result = updateRolePermissionsSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error.format() },
        { status: 400 }
      );
    }

    const { roleId, permissionIds } = result.data;

    // Check if user has admin permissions
    const userRole = await prisma.teamMember.findFirst({
      where: {
        userId: session.user.id,
        role: "admin",
      },
    });

    if (!userRole) {
      return NextResponse.json(
        { error: "You don't have permission to update role permissions" },
        { status: 403 }
      );
    }

    // Check if role exists
    const role = await prisma.role.findUnique({
      where: {
        id: roleId,
      },
    });

    if (!role) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    // Perform the update in a transaction
    await prisma.$transaction(async (tx) => {
      // Delete existing role permissions
      await tx.rolePermission.deleteMany({
        where: {
          roleId,
        },
      });

      // Create new role permissions
      await Promise.all(
        permissionIds.map((permissionId) =>
          tx.rolePermission.create({
            data: {
              roleId,
              permissionId,
            },
          })
        )
      );
    });

    // Get updated role with permissions
    const updatedRole = await prisma.role.findUnique({
      where: {
        id: roleId,
      },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    // Format the response
    return NextResponse.json({
      id: updatedRole?.id,
      name: updatedRole?.name,
      description: updatedRole?.description,
      permissions: updatedRole?.permissions.map((rp: any) => ({
        id: rp.permission.id,
        name: rp.permission.name,
        description: rp.permission.description,
        module: rp.permission.module,
      })),
    });
  } catch (error) {
    console.error("Error updating permissions:", error);
    return NextResponse.json(
      { error: "Failed to update permissions" },
      { status: 500 }
    );
  }
}
