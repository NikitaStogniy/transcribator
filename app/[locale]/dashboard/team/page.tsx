"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useSetSelectedTeam } from "@/hooks/use-selected-team";
import {
  useTeam,
  useTeamMembersByRole,
  useAddTeamMember,
} from "@/hooks/use-team";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PlusCircle, UserPlus, Check, X } from "lucide-react";

export default function TeamPage() {
  const t = useTranslations();

  // Set a default selected team ID (in a real app, this would be from user preferences)
  const setSelectedTeamId = useSetSelectedTeam();

  useEffect(() => {
    setSelectedTeamId("team-1");
  }, [setSelectedTeamId]);

  const { data, isLoading, error } = useTeam();
  const membersByRole = useTeamMembersByRole();
  const { mutate: addMember, isPending: isAddingMember } = useAddTeamMember();

  const handleAddMember = (role: "admin" | "editor" | "viewer") => {
    // In a real app, this would open a modal to select a user and set their role
    console.log(`Add member with role: ${role}`);
    // For demo purposes, we'll just add a mock user
    addMember({
      userId: "user-6", // This would be selected by the user
      name: "New Team Member",
      email: "new.member@example.com",
      role: role,
      teamId: "team-1", // This would be the selected team
    });
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-500";
      case "editor":
        return "bg-blue-500";
      case "viewer":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  if (isLoading) {
    return <div>{t("Common.loading")}</div>;
  }

  if (error) {
    return <div>Error loading team data: {(error as Error).message}</div>;
  }

  return (
    <div className="container w-full space-y-6 p-4">
      <Card className="w-full">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>{data?.team?.name || t("Navigation.team")}</CardTitle>
            <CardDescription>
              Manage team members and their permissions
            </CardDescription>
            <div className="flex space-x-2">
              <Button
                size="sm"
                onClick={() => handleAddMember("viewer")}
                disabled={isAddingMember}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                {t("Dashboard.team.addMember")}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">
                {t("Dashboard.team.title")}
              </h3>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("Dashboard.team.name")}</TableHead>
                  <TableHead>{t("Dashboard.team.email")}</TableHead>
                  <TableHead>{t("Dashboard.team.role")}</TableHead>
                  <TableHead>{t("Dashboard.team.joined")}</TableHead>
                  <TableHead className="text-right">
                    {t("Dashboard.team.actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {membersByRole.all.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={member.image} />
                          <AvatarFallback>
                            {getInitials(member.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span>{member.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>
                      <Badge className={getRoleBadgeColor(member.role)}>
                        {member.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(member.joinedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" size="icon">
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="text-red-500"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter>
          <div className="flex justify-between w-full">
            <div>
              <p className="text-sm text-gray-500">
                {t("Dashboard.team.totalMembers")}: {membersByRole.all.length}
              </p>
            </div>
            <div className="flex space-x-4">
              <p className="text-sm text-gray-500">
                {t("Dashboard.team.admins")}: {membersByRole.admin.length}
              </p>
              <p className="text-sm text-gray-500">
                {t("Dashboard.team.editors")}: {membersByRole.editor.length}
              </p>
              <p className="text-sm text-gray-500">
                {t("Dashboard.team.viewers")}: {membersByRole.viewer.length}
              </p>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
