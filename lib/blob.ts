import {
  put,
  del,
  list,
  PutBlobResult,
  ListBlobResultBlob,
} from "@vercel/blob";

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
  try {
    // Create a unique path for the file with teamId/userId/fileName structure
    const filePath = `${teamId}/${userId}/${Date.now()}-${file.name}`;

    // Upload to Vercel Blob
    const blob = await put(filePath, file, {
      access: "public", // You can adjust this as needed (public/private)
      addRandomSuffix: false,
    });

    return blob;
  } catch (error) {
    console.error("Error uploading file to Blob storage:", error);
    throw new Error("Failed to upload file");
  }
}

// Delete a file from Vercel Blob storage
export async function deleteFile(url: string): Promise<void> {
  try {
    await del(url);
  } catch (error) {
    console.error("Error deleting file from Blob storage:", error);
    throw new Error("Failed to delete file");
  }
}

// List files from a specific directory
export async function listFiles(prefix: string): Promise<BlobFile[]> {
  try {
    const { blobs } = await list({ prefix });
    return blobs as BlobFile[];
  } catch (error) {
    console.error("Error listing files from Blob storage:", error);
    throw new Error("Failed to list files");
  }
}
