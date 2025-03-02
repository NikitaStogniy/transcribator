"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useSetSelectedTeam } from "@/hooks/use-selected-team";
import { useFiles, useFilesByStatus, useFileUpload } from "@/hooks/use-files";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FileUp,
  File,
  Loader2,
  CheckCircle2,
  AlertCircle,
  UploadCloud,
} from "lucide-react";

export default function FilesPage() {
  const t = useTranslations();

  // Set a default selected team ID (in a real app, this would be from user preferences)
  const setSelectedTeamId = useSetSelectedTeam();

  useEffect(() => {
    setSelectedTeamId("team-1");
  }, [setSelectedTeamId]);

  const { isLoading, error } = useFiles();
  const filesByStatus = useFilesByStatus();
  const { mutate: uploadFile, isPending: isUploading } = useFileUpload();

  const handleUploadFile = () => {
    // In a real app, this would open a file picker
    console.log("Upload file");
    // For demo purposes, we'll just upload a mock file
    uploadFile({
      name: `Meeting-${new Date().toISOString().split("T")[0]}.mp3`,
      type: "audio/mp3",
      size: 25000000,
      // We don't need to specify teamId anymore since the backend will use the user's default team
      // The API will automatically use the user's default team
      uploadedBy: "user-1", // This would be the current user
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-100 text-yellow-800 border-yellow-300"
          >
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Pending
          </Badge>
        );
      case "processing":
        return (
          <Badge
            variant="outline"
            className="bg-blue-100 text-blue-800 border-blue-300"
          >
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Processing
          </Badge>
        );
      case "completed":
        return (
          <Badge
            variant="outline"
            className="bg-green-100 text-green-800 border-green-300"
          >
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      case "error":
        return (
          <Badge
            variant="outline"
            className="bg-red-100 text-red-800 border-red-300"
          >
            <AlertCircle className="h-3 w-3 mr-1" />
            Error
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (isLoading) {
    return <div>{t("Common.loading")}</div>;
  }

  if (error) {
    return <div>Error loading files: {(error as Error).message}</div>;
  }

  return (
    <div className="container w-full space-y-6 p-4">
      <Card className="w-full">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>{t("Dashboard.files.title")}</CardTitle>
            <div className="flex space-x-2">
              <Button
                size="sm"
                onClick={handleUploadFile}
                disabled={isUploading}
              >
                <UploadCloud className="h-4 w-4 mr-2" />
                {t("Dashboard.files.upload")}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4 mb-4">
            <Card className="flex-1 p-4 border border-gray-200">
              <div className="text-sm text-gray-500">Total Files</div>
              <div className="text-2xl font-bold">
                {filesByStatus.all.length}
              </div>
            </Card>
            <Card className="flex-1 p-4 border border-green-200 bg-green-50">
              <div className="text-sm text-green-800">Completed</div>
              <div className="text-2xl font-bold">
                {filesByStatus.completed.length}
              </div>
            </Card>
            <Card className="flex-1 p-4 border border-blue-200 bg-blue-50">
              <div className="text-sm text-blue-800">Processing</div>
              <div className="text-2xl font-bold">
                {filesByStatus.processing.length}
              </div>
            </Card>
            <Card className="flex-1 p-4 border border-yellow-200 bg-yellow-50">
              <div className="text-sm text-yellow-800">Pending</div>
              <div className="text-2xl font-bold">
                {filesByStatus.pending.length}
              </div>
            </Card>
            <Card className="flex-1 p-4 border border-red-200 bg-red-50">
              <div className="text-sm text-red-800">Error</div>
              <div className="text-2xl font-bold">
                {filesByStatus.error.length}
              </div>
            </Card>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("Dashboard.files.status")}</TableHead>
                <TableHead>{t("Dashboard.files.name")}</TableHead>
                <TableHead>{t("Dashboard.files.size")}</TableHead>
                <TableHead>{t("Dashboard.files.uploadDate")}</TableHead>
                <TableHead className="text-right">
                  {t("Dashboard.files.actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filesByStatus.all.map((file) => (
                <TableRow key={file.id}>
                  <TableCell>{getStatusBadge(file.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <File className="h-5 w-5 text-gray-500" />
                      <span>{file.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{formatFileSize(file.size)}</TableCell>
                  <TableCell>
                    {new Date(file.uploadedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-gray-500">
            Files are sorted by upload date (newest first)
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
