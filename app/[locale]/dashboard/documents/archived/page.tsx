"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Archive, FileText, Loader2 } from "lucide-react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useSetSelectedTeam, useUserTeams } from "@/hooks/use-selected-team";
import { useDocuments } from "@/hooks/use-documents";

export default function DocumentsArchivePage() {
  const t = useTranslations();

  // Set a default selected team ID
  const setSelectedTeamId = useSetSelectedTeam();
  const { data: userTeamsData } = useUserTeams();

  useEffect(() => {
    // Only set a team if we have teams data and there's at least one team
    if (userTeamsData?.teams && userTeamsData.teams.length > 0) {
      // Use the first available team
      setSelectedTeamId(userTeamsData.teams[0].id);
    }
  }, [setSelectedTeamId, userTeamsData]);

  const { isLoading, error, data: documents = [] } = useDocuments();

  // For demo purposes, filter to show only "archived" documents
  // In a real app, this would likely be a separate API endpoint or filter parameter
  const archivedDocuments = documents.filter(
    (doc) => doc.id.includes("5") || doc.id.includes("7")
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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
                <Archive className="mr-2 h-5 w-5" />
                {t("Dashboard.documents.archived")}
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
          {archivedDocuments.length === 0 ? (
            <div className="text-center py-10">
              <Archive className="mx-auto h-10 w-10 text-muted-foreground" />
              <p className="mt-2 text-muted-foreground">
                No archived documents found
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("Dashboard.documents.name")}</TableHead>
                  <TableHead>{t("Dashboard.documents.createdAt")}</TableHead>
                  <TableHead>{t("Dashboard.documents.updatedAt")}</TableHead>
                  <TableHead className="text-right">
                    {t("Dashboard.documents.actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {archivedDocuments.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{doc.title}</span>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(doc.createdAt)}</TableCell>
                    <TableCell>{formatDate(doc.updatedAt)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        {t("Common.delete")}
                      </Button>
                      <Button variant="outline" size="sm" className="ml-2">
                        {t("Dashboard.documents.title")}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
