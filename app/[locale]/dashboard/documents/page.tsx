"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useSetSelectedTeam } from "@/hooks/use-selected-team";
import {
  useDocuments,
  useDocumentsSortedByDate,
  useCreateDocument,
} from "@/hooks/use-documents";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  Loader2,
  Clock,
  Share2,
  Archive,
  FilePlus,
} from "lucide-react";
import { Table, TableHeader, TableRow, TableHead } from "@/components/ui/table";
import { useTeamSelection } from "@/hooks/use-team-selection";

export default function DocumentsPage() {
  const t = useTranslations();
  const { selectedTeamId } = useTeamSelection();

  const { isLoading, error } = useDocuments();
  const sortedDocuments = useDocumentsSortedByDate();
  const { mutate: createDocument, isPending: isCreating } = useCreateDocument();

  const handleCreateDocument = () => {
    // In a real app, this would open a form to create a document
    console.log("Create document");
    // For demo purposes, we'll just create a mock document
    createDocument({
      title: `Meeting Summary - ${new Date().toLocaleDateString()}`,
      fileId: "file-1", // This would be selected by the user
      teamId: selectedTeamId as string, // Use the currently selected team ID
      createdBy: "user-1", // This would be the current user
      summary: "This is a sample meeting summary created from the UI.",
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  if (isLoading) {
    return <div>{t("Common.loading")}</div>;
  }

  if (error) {
    return <div>Error loading documents: {(error as Error).message}</div>;
  }

  return (
    <div className="container w-full space-y-6 p-4">
      <Card className="w-full">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>{t("Dashboard.documents.title")}</CardTitle>
            <Button
              size="sm"
              onClick={handleCreateDocument}
              disabled={isCreating}
            >
              <FilePlus className="h-4 w-4 mr-2" />
              {t("Dashboard.documents.create")}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="recent">
            <TabsList>
              <TabsTrigger value="recent">
                {t("Dashboard.documents.recent")}
              </TabsTrigger>
              <TabsTrigger value="all">
                {t("Dashboard.documents.all")}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="recent">
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
                {/* ... existing table body */}
              </Table>
            </TabsContent>
            <TabsContent value="all">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedDocuments.map((doc) => (
                  <Card key={doc.id} className="h-full">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">{doc.title}</CardTitle>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="icon">
                            <Share2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Archive className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <CardDescription className="flex items-center text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        {new Date(doc.updatedAt).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">
                        {truncateText(doc.summary, 200)}
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" size="sm" className="w-full">
                        View Details
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
