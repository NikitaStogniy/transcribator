"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Loader2, Share2, Users } from "lucide-react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSetSelectedTeam } from "@/hooks/use-selected-team";
import { useDocuments } from "@/hooks/use-documents";
import { useTeamSelection } from "@/hooks/use-team-selection";

export default function DocumentsSharedPage() {
  const t = useTranslations();

  // Use team selection hooks
  const { selectedTeamId } = useTeamSelection();
  const setSelectedTeamId = useSetSelectedTeam();

  // No need to set a hardcoded team ID, the useTeamSelection hook
  // automatically selects the first available team if none is selected

  const { isLoading, error, data: documents = [] } = useDocuments();

  // For demo purposes, filter to show only "shared" documents
  // In a real app, this would likely be a separate API endpoint or filter parameter
  const sharedDocuments = documents.filter(
    (doc) =>
      doc.id.includes("2") || doc.id.includes("4") || doc.id.includes("6")
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Mock shared users (in a real app this would come from an API)
  const getSharedUsers = (docId: string) => {
    const users = [
      { id: "u1", name: "Alex", image: "" },
      { id: "u2", name: "Sam", image: "" },
      { id: "u3", name: "Jamie", image: "" },
      { id: "u4", name: "Taylor", image: "" },
    ];

    // Return 1-3 random users for each document
    return users.slice(0, (parseInt(docId.slice(-1)) % 3) + 1);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">{t("Common.loading")}</span>
      </div>
    );
  }

  if (error) {
    return <div>Error loading documents: {(error as Error).message}</div>;
  }

  return (
    <div className="container w-full space-y-6 p-4">
      <Card className="w-full">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>
              <div className="flex items-center">
                <Share2 className="mr-2 h-5 w-5" />
                {t("Dashboard.documents.shared")}
              </div>
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.history.back()}
            >
              {t("Dashboard.back")}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {sharedDocuments.length === 0 ? (
            <div className="text-center py-10">
              <Share2 className="mx-auto h-10 w-10 text-muted-foreground" />
              <p className="mt-2 text-muted-foreground">
                No shared documents found
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("Dashboard.documents.name")}</TableHead>
                  <TableHead>{t("Dashboard.documents.updatedAt")}</TableHead>
                  <TableHead>Shared With</TableHead>
                  <TableHead className="text-right">
                    {t("Dashboard.documents.actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sharedDocuments.map((doc) => {
                  const sharedUsers = getSharedUsers(doc.id);
                  return (
                    <TableRow key={doc.id}>
                      <TableCell>
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{doc.title}</span>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(doc.updatedAt)}</TableCell>
                      <TableCell>
                        <div className="flex -space-x-2">
                          {sharedUsers.map((user) => (
                            <Avatar
                              key={user.id}
                              className="h-8 w-8 border-2 border-background"
                            >
                              <AvatarFallback>
                                {user.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                          >
                            <Users className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          {t("Common.edit")}
                        </Button>
                        <Button variant="outline" size="sm" className="ml-2">
                          {t("Dashboard.documents.title")}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
