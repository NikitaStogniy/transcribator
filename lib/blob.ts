import {
  put,
  del,
  list,
  PutBlobResult,
  ListBlobResultBlob,
} from "@vercel/blob";

// Helper function for consistent logging
function logInfo(operation: string, message: string, data?: any) {
  const logMessage = `[BLOB:${operation}] ${message}`;
  console.log(logMessage, data ? data : "");
}

function logError(operation: string, message: string, error: any) {
  const logMessage = `[BLOB:${operation}:ERROR] ${message}`;
  console.error(logMessage, error);
}

export type BlobFile = {
  url: string;
  pathname: string;
  contentType?: string;
  contentDisposition?: string;
  size: number;
};

// Upload a file to Vercel Blob storage
export async function uploadFile(
  file: File,
  teamId: string,
  userId: string
): Promise<PutBlobResult> {
  const operationId = `upload_${Date.now()}`;
  try {
    logInfo("UPLOAD", `Starting file upload operation ${operationId}`);
    logInfo(
      "UPLOAD",
      `File details: name=${file.name}, size=${file.size}, type=${file.type}`
    );

    // Create a unique path for the file with teamId/userId/fileName structure
    const filePath = `${teamId}/${userId}/${Date.now()}-${file.name}`;
    logInfo("UPLOAD", `Generated blob path: ${filePath}`);

    // Upload to Vercel Blob
    logInfo("UPLOAD", `Sending file to Vercel Blob storage`);
    const startTime = Date.now();
    const blob = await put(filePath, file, {
      access: "public", // You can adjust this as needed (public/private)
      addRandomSuffix: false,
    });
    const duration = Date.now() - startTime;

    logInfo("UPLOAD", `Upload successful in ${duration}ms`, {
      url: blob.url,
      pathname: blob.pathname,
      uploadDurationMs: duration,
    });

    return blob;
  } catch (error) {
    logError(
      "UPLOAD",
      `Failed to upload file ${file.name} (operation ${operationId})`,
      error
    );
    throw new Error("Failed to upload file");
  }
}

// Delete a file from Vercel Blob storage
export async function deleteFile(url: string): Promise<void> {
  const operationId = `delete_${Date.now()}`;
  try {
    logInfo(
      "DELETE",
      `Starting delete operation ${operationId} for URL: ${url}`
    );

    const startTime = Date.now();
    await del(url);
    const duration = Date.now() - startTime;

    logInfo("DELETE", `File deleted successfully in ${duration}ms: ${url}`);
  } catch (error) {
    logError(
      "DELETE",
      `Failed to delete file ${url} (operation ${operationId})`,
      error
    );
    throw new Error("Failed to delete file");
  }
}

// List files from a specific directory
export async function listFiles(prefix: string): Promise<BlobFile[]> {
  const operationId = `list_${Date.now()}`;
  try {
    logInfo(
      "LIST",
      `Starting list operation ${operationId} with prefix: ${prefix}`
    );

    const startTime = Date.now();
    const { blobs } = await list({ prefix });
    const duration = Date.now() - startTime;

    logInfo(
      "LIST",
      `Listed ${blobs.length} files in ${duration}ms with prefix: ${prefix}`
    );

    return blobs as BlobFile[];
  } catch (error) {
    logError(
      "LIST",
      `Failed to list files with prefix ${prefix} (operation ${operationId})`,
      error
    );
    throw new Error("Failed to list files");
  }
}
