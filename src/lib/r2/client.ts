import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  DeleteObjectsCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const accountId = process.env.R2_ACCOUNT_ID || "dummy-account-id";
const accessKeyId = process.env.R2_ACCESS_KEY_ID || "dummy-access-key";
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || "dummy-secret-key";

export const r2BucketName = (process.env.R2_BUCKET_NAME || "galeria").trim().replace(/^["']|["']$/g, "");

export const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
  forcePathStyle: true,
});

/**
 * Gera presigned URL para upload direto do navegador para o R2 (sem passar tráfego pesado pelo Next.js)
 */
export async function getPresignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn = 3600
): Promise<{ uploadUrl: string; key: string }> {
  const command = new PutObjectCommand({
    Bucket: r2BucketName,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn });
  return { uploadUrl, key };
}

/**
 * Gera presigned URL para visualização direta no navegador
 */
export async function getPresignedViewUrl(
  key: string,
  expiresIn = 86400
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: r2BucketName,
    Key: key,
  });

  return getSignedUrl(r2Client, command, { expiresIn });
}

/**
 * Gera presigned URL para download em alta resolução
 */
export async function getPresignedDownloadUrl(
  key: string,
  downloadFilename: string,
  expiresIn = 3600
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: r2BucketName,
    Key: key,
    ResponseContentDisposition: `attachment; filename="${encodeURIComponent(downloadFilename)}"`,
  });

  return getSignedUrl(r2Client, command, { expiresIn });
}

/**
 * Exclui objeto individual do R2
 */
export async function deleteR2Object(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: r2BucketName,
    Key: key,
  });

  await r2Client.send(command);
}

/**
 * Exclui todos os arquivos pertencentes a uma galeria no Cloudflare R2
 * Varre o prefixo "originals/{galleryId}/" e remove em lote
 */
export async function deleteR2GalleryFolder(galleryId: string): Promise<{ deletedCount: number }> {
  try {
    const prefix = `originals/${galleryId}/`;
    let continuationToken: string | undefined = undefined;
    let totalDeleted = 0;

    while (true) {
      const listCommand = new ListObjectsV2Command({
        Bucket: r2BucketName,
        Prefix: prefix,
        ContinuationToken: continuationToken,
      });

      const listResponse: any = await r2Client.send(listCommand);

      if (listResponse.Contents && listResponse.Contents.length > 0) {
        const objectsToDelete = listResponse.Contents.map((item: any) => ({ Key: item.Key! }));

        const deleteCommand = new DeleteObjectsCommand({
          Bucket: r2BucketName,
          Delete: {
            Objects: objectsToDelete,
            Quiet: true,
          },
        });

        await r2Client.send(deleteCommand);
        totalDeleted += objectsToDelete.length;
      }

      if (listResponse.IsTruncated && listResponse.NextContinuationToken) {
        continuationToken = listResponse.NextContinuationToken;
      } else {
        break;
      }
    }

    return { deletedCount: totalDeleted };
  } catch (error) {
    console.error(`Erro ao excluir pasta R2 da galeria ${galleryId}:`, error);
    throw error;
  }
}

/**
 * Constrói chave padrão de armazenamento no R2
 */
export function buildPhotoR2Key(galleryId: string, photoId: string, filename: string): string {
  const cleanFilename = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `originals/${galleryId}/${photoId}_${cleanFilename}`;
}
