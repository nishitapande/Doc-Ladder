const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");
const crypto = require("crypto");
const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

// Local storage base path (inside server/uploads)
const LOCAL_UPLOADS_DIR = path.join(__dirname, "..", "uploads");

// Determine if Cloudflare R2 is configured
const isR2Active = () => {
  const driver = (process.env.STORAGE_DRIVER || "").toLowerCase();
  const hasKeys =
    Boolean(process.env.R2_ACCOUNT_ID) &&
    Boolean(process.env.R2_ACCESS_KEY_ID) &&
    Boolean(process.env.R2_SECRET_ACCESS_KEY) &&
    Boolean(process.env.R2_BUCKET_NAME);

  if (driver === "r2" || (process.env.NODE_ENV === "production" && hasKeys)) {
    return true;
  }
  return false;
};

// Singleton S3/R2 client instance
let s3ClientInstance = null;

const getR2Client = () => {
  if (!s3ClientInstance) {
    s3ClientInstance = new S3Client({
      region: "auto",
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      },
    });
  }
  return s3ClientInstance;
};

// Helper: Ensure local folder exists
const ensureLocalDir = async (filePath) => {
  const dir = path.dirname(filePath);
  await fsp.mkdir(dir, { recursive: true });
};

// Helper: Resolve local file path
const resolveLocalPath = (storageKey) => {
  // Sanitize path to prevent directory traversal
  const safeKey = storageKey.replace(/^(\.\.(\/|\\|$))+/, "");
  return path.join(LOCAL_UPLOADS_DIR, safeKey);
};

// Compute SHA-256 hash of a buffer
const computeSha256 = (buffer) => {
  return crypto.createHash("sha256").update(buffer).digest("hex");
};

/**
 * Upload a file to storage (Cloudflare R2 in prod, local disk in dev)
 * @param {Object} params
 * @param {string} params.storageKey - e.g. "files/org_id/doc_uuid.pdf"
 * @param {Buffer} params.buffer - file content buffer
 * @param {string} params.mimeType - e.g. "application/pdf"
 * @returns {Promise<{ storageKey: string, fileUrl: string, sha256: string, sizeBytes: number }>}
 */
const uploadFile = async ({ storageKey, buffer, mimeType }) => {
  const sha256 = computeSha256(buffer);
  const sizeBytes = buffer.length;

  if (isR2Active()) {
    const client = getR2Client();
    const bucket = process.env.R2_BUCKET_NAME;

    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: storageKey,
        Body: buffer,
        ContentType: mimeType,
      })
    );

    // In production with R2, if a public custom domain is configured use that,
    // otherwise use our backend proxy stream route
    const publicDomain = process.env.R2_PUBLIC_DOMAIN;
    const fileUrl = publicDomain
      ? `${publicDomain.replace(/\/$/, "")}/${storageKey}`
      : `/v1/api/files/download/${encodeURIComponent(storageKey)}`;

    return { storageKey, fileUrl, sha256, sizeBytes, driver: "r2" };
  } else {
    // Local Disk Mode
    const localFilePath = resolveLocalPath(storageKey);
    await ensureLocalDir(localFilePath);
    await fsp.writeFile(localFilePath, buffer);

    const fileUrl = `/v1/api/files/download/${encodeURIComponent(storageKey)}`;
    return { storageKey, fileUrl, sha256, sizeBytes, driver: "local" };
  }
};

/**
 * Retrieve a file as a Buffer (useful for PDF editing or hashing)
 * @param {string} storageKey
 * @returns {Promise<Buffer>}
 */
const getFileBuffer = async (storageKey) => {
  if (isR2Active()) {
    const client = getR2Client();
    const bucket = process.env.R2_BUCKET_NAME;

    const response = await client.send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: storageKey,
      })
    );

    // Stream to Buffer
    const chunks = [];
    for await (const chunk of response.Body) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks);
  } else {
    const localFilePath = resolveLocalPath(storageKey);
    return await fsp.readFile(localFilePath);
  }
};

/**
 * Get a readable stream for high-performance downloading/viewing
 * @param {string} storageKey
 * @returns {Promise<ReadableStream|fs.ReadStream>}
 */
const getFileStream = async (storageKey) => {
  if (isR2Active()) {
    const client = getR2Client();
    const bucket = process.env.R2_BUCKET_NAME;

    const response = await client.send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: storageKey,
      })
    );
    return response.Body;
  } else {
    const localFilePath = resolveLocalPath(storageKey);
    return fs.createReadStream(localFilePath);
  }
};

/**
 * Delete a file from storage
 * @param {string} storageKey
 */
const deleteFile = async (storageKey) => {
  if (isR2Active()) {
    const client = getR2Client();
    const bucket = process.env.R2_BUCKET_NAME;

    await client.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: storageKey,
      })
    );
  } else {
    const localFilePath = resolveLocalPath(storageKey);
    try {
      await fsp.unlink(localFilePath);
    } catch (err) {
      if (err.code !== "ENOENT") throw err;
    }
  }
};

/**
 * Get a secure presigned download URL
 * @param {string} storageKey
 * @param {string} [filename]
 * @param {number} [expiresIn=900] - 15 minutes default
 * @returns {Promise<string>}
 */
const getPresignedDownloadUrl = async (
  storageKey,
  filename = "document.pdf",
  expiresIn = 900
) => {
  if (isR2Active()) {
    const client = getR2Client();
    const bucket = process.env.R2_BUCKET_NAME;

    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: storageKey,
      ResponseContentDisposition: `inline; filename="${encodeURIComponent(filename)}"`,
    });

    return await getSignedUrl(client, command, { expiresIn });
  } else {
    // In local mode, return API stream endpoint with filename
    return `/v1/api/files/download/${encodeURIComponent(storageKey)}?filename=${encodeURIComponent(filename)}`;
  }
};

module.exports = {
  isR2Active,
  uploadFile,
  getFileBuffer,
  getFileStream,
  deleteFile,
  getPresignedDownloadUrl,
  computeSha256,
};
