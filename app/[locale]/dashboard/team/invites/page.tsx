"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useSelectedTeam } from "@/hooks/use-selected-team";
import { useTeam, TeamRole } from "@/hooks/use-team";
import {
  useTeamInvites,
  useTeamInvitesByStatus,
  useCreateTeamInvite,
  useDeleteTeamInvite,
  useResendTeamInvite,
  TeamInvite,
  InviteStatus,
} from "@/hooks/use-team-invites";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserPlus, Mail, Copy, Check, X, Clock } from "lucide-react";

export default function TeamInvitesPage() {
  const t = useTranslations();
  const { data: selectedTeamId } = useSelectedTeam();
  const { data: teamData } = useTeam();
  const { data: allInvites = [] } = useTeamInvites();
  const invitesByStatus = useTeamInvitesByStatus();
  const { mutateAsync: createInvite, isPending: isCreating } =
    useCreateTeamInvite();
  const { mutateAsync: deleteInvite, isPending: isDeleting } =
    useDeleteTeamInvite();
  const { mutateAsync: resendInvite, isPending: isResending } =
    useResendTeamInvite();

  const [email, setEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState<TeamRole>("viewer");
  const [inviteLink, setInviteLink] = useState("");
  const [copied, setCopied] = useState(false);

  // Filter invites by status
  const pendingInvites = invitesByStatus.pending;
  const acceptedInvites = invitesByStatus.accepted;
  const expiredInvites = invitesByStatus.expired;

  const handleCreateInvite = async () => {
    if (!selectedTeamId || !email || !selectedRole) return;

    try {
      const result = await createInvite({
        teamId: selectedTeamId,
        email,
        role: selectedRole,
      });

      // Set the invite link from the API response
      setInviteLink(result.inviteLink);

      // Reset the form
      setEmail("");
    } catch (error) {
      console.error("Error creating invite:", error);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDeleteInvite = async (id: string) => {
    try {
      await deleteInvite(id);
    } catch (error) {
      console.error("Error deleting invite:", error);
    }
  };

  const handleResendInvite = async (id: string) => {
    try {
      const result = await resendInvite(id);
      setInviteLink(result.inviteLink);
    } catch (error) {
      console.error("Error resending invite:", error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getRoleBadgeVariant = (role: TeamRole) => {
    switch (role) {
      case "admin":
        return "destructive";
      case "editor":
        return "default";
      case "viewer":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getStatusBadgeVariant = (status: InviteStatus) => {
    switch (status) {
      case "pending":
        return "secondary";
      case "accepted":
        return "default";
      case "expired":
        return "outline";
      default:
        return "outline";
    }
  };

  const getStatusIcon = (status: InviteStatus) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "accepted":
        return <Check className="h-4 w-4" />;
      case "expired":
        return <X className="h-4 w-4" />;
      default:
        return null;
    }
  };

  if (!selectedTeamId || !teamData) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">
              {t("Dashboard.team.loading")}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container w-full space-y-6 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t("Dashboard.team.invites")}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("Dashboard.team.createInvite")}</CardTitle>
          <CardDescription>
            {t("Dashboard.team.createInviteDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                {t("Dashboard.team.email")}
              </label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t("Dashboard.team.role")}
              </label>
              <div className="flex space-x-2">
                {(["viewer", "editor", "admin"] as TeamRole[]).map((role) => (
                  <Button
                    key={role}
                    variant={selectedRole === role ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedRole(role)}
                    className="capitalize"
                  >
                    {t(`Dashboard.team.${role.toLowerCase()}s`)}
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex items-end">
              <Button onClick={handleCreateInvite} className="w-full">
                <UserPlus className="mr-2 h-4 w-4" />
                {t("Dashboard.team.createInvite")}
              </Button>
            </div>
          </div>

          {inviteLink && (
            <div className="mt-4 p-4 border rounded-md bg-secondary/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {t("Dashboard.team.inviteLink")}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyLink}
                  className="h-8"
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  {copied ? t("Dashboard.copied") : t("Dashboard.copy")}
                </Button>
              </div>
              <p className="mt-2 text-sm truncate">{inviteLink}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("Dashboard.team.invitesList")}</CardTitle>
          <CardDescription>
            {t("Dashboard.team.invitesDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending">
            <TabsList className="mb-4">
              <TabsTrigger value="pending">
                {t("Dashboard.team.pending")} ({pendingInvites.length})
              </TabsTrigger>
              <TabsTrigger value="accepted">
                {t("Dashboard.team.accepted")} ({acceptedInvites.length})
              </TabsTrigger>
              <TabsTrigger value="expired">
                {t("Dashboard.team.expired")} ({expiredInvites.length})
              </TabsTrigger>
            </TabsList>

            {["pending", "accepted", "expired"].map((status) => (
              <TabsContent key={status} value={status}>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("Dashboard.team.email")}</TableHead>
                      <TableHead>{t("Dashboard.team.role")}</TableHead>
                      <TableHead>{t("Dashboard.team.status")}</TableHead>
                      <TableHead>{t("Dashboard.team.createdAt")}</TableHead>
                      <TableHead>{t("Dashboard.team.expiresAt")}</TableHead>
                      <TableHead className="text-right">
                        {t("Dashboard.team.actions")}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invitesByStatus[
                      status as keyof typeof invitesByStatus
                    ].map((invite) => (
                      <TableRow key={invite.id}>
                        <TableCell>{invite.email}</TableCell>
                        <TableCell>
                          <Badge
                            variant={getRoleBadgeVariant(invite.role)}
                            className="capitalize"
                          >
                            {t(`Dashboard.team.${invite.role.toLowerCase()}s`)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            {getStatusIcon(invite.status)}
                            <Badge
                              variant={getStatusBadgeVariant(invite.status)}
                              className="ml-2 capitalize"
                            >
                              {t(`Dashboard.team.${invite.status}`)}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(invite.createdAt)}</TableCell>
                        <TableCell>{formatDate(invite.expiresAt)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            {invite.status === "pending" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleResendInvite(invite.id)}
                              >
                                <Mail className="h-4 w-4" />
                                {t("Dashboard.team.resend")}
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteInvite(invite.id)}
                            >
                              <X className="h-4 w-4" />
                              {t("Dashboard.team.delete")}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {invitesByStatus[status as keyof typeof invitesByStatus]
                      .length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-10">
                          <p className="text-muted-foreground">
                            {t("Dashboard.team.noInvites")}
                          </p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
