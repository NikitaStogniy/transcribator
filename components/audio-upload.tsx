"use client";

import * as React from "react";
import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, UploadIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useFileUpload } from "@/hooks/use-files";
import { useSelectedTeam } from "@/hooks/use-selected-team";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Progress } from "@/components/ui/progress";

export function AudioUploadButton({
  className,
}: React.ComponentProps<typeof Button>) {
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const t = useTranslations("Dashboard.files");

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="default" className={cn("gap-2", className)}>
            <UploadIcon className="h-4 w-4" />
            {t("uploadAudio")}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t("audioUpload.title")}</DialogTitle>
            <DialogDescription>
              {t("audioUpload.description")}
            </DialogDescription>
          </DialogHeader>
          <AudioUploadForm onSuccess={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="default" className={cn("gap-2", className)}>
          <UploadIcon className="h-4 w-4" />
          {t("uploadAudio")}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>{t("audioUpload.title")}</DrawerTitle>
          <DrawerDescription>{t("audioUpload.description")}</DrawerDescription>
        </DrawerHeader>
        <div className="px-4 pb-4">
          <AudioUploadForm onSuccess={() => setOpen(false)} />
        </div>
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">{t("cancel", { ns: "Common" })}</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

interface AudioUploadFormProps extends React.ComponentProps<"form"> {
  onSuccess?: () => void;
}

function AudioUploadForm({ className, onSuccess }: AudioUploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { mutateAsync: uploadFile } = useFileUpload();
  const { data: selectedTeamId } = useSelectedTeam();
  const t = useTranslations("Dashboard.files.audioUpload");
  const commonT = useTranslations("Common");

  // Set up progress simulation
  React.useEffect(() => {
    if (uploading) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95) {
            clearInterval(interval);
            return prev;
          }
          return prev + 5;
        });
      }, 200);

      return () => clearInterval(interval);
    }
  }, [uploading]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const audioFile = acceptedFiles[0];
    if (audioFile) {
      setFile(audioFile);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "audio/*": [".mp3", ".wav", ".m4a"],
    },
    maxFiles: 1,
    multiple: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file || !selectedTeamId) {
      toast.error(t("error"), {
        description: t("teamRequired"),
      });
      return;
    }

    try {
      setUploading(true);
      setProgress(0);

      await uploadFile({
        name: file.name,
        type: file.type,
        size: file.size,
        teamId: selectedTeamId,
        file: file,
      });

      setProgress(100);

      toast.success(t("success"), {
        description: t("successDetail"),
      });

      // Reset state
      setFile(null);
      setUploading(false);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error(t("error"), {
        description: t("errorDetail"),
      });
      setUploading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("grid items-start gap-4", className)}
    >
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-6 hover:border-primary/50 transition-colors cursor-pointer flex flex-col items-center justify-center",
          isDragActive ? "border-primary" : "border-muted",
          uploading && "pointer-events-none opacity-60"
        )}
      >
        <input {...getInputProps()} disabled={uploading} />
        <Upload className="h-10 w-10 text-muted-foreground mb-2" />

        {file ? (
          <div className="text-center">
            <p className="font-medium text-sm">{file.name}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {(file.size / (1024 * 1024)).toFixed(2)} MB
            </p>
          </div>
        ) : (
          <div className="text-center">
            <p className="font-medium text-sm">{t("dragDrop")}</p>
            <p className="text-xs text-muted-foreground mt-1">{t("browse")}</p>
          </div>
        )}
      </div>

      {uploading && (
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground text-right">
            {progress}%
          </p>
        </div>
      )}

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={!file || uploading} className="gap-2">
          {uploading ? t("uploading") : t("uploadButton")}
        </Button>
      </div>
    </form>
  );
}
