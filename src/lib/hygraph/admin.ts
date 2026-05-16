import {
  getHygraphAssetToken,
  getHygraphCdnEndpoint,
  getHygraphContentEndpoint,
  getHygraphContentToken,
} from "@/lib/hygraph/content-endpoint";

const SITE_SETTINGS_SLUG = "main";
const POLL_INITIAL_MS = 500;
const POLL_MAX_MS = 1500;
/** Hygraph PDF processing often takes 50–70s on create/re-upload. */
const POLL_MAX_ATTEMPTS = 90;
const PUBLISHED_URL_ATTEMPTS = 6;
const PUBLISHED_URL_MS = 400;

interface HygraphAsset {
  id: string;
  url: string;
  fileName: string;
  mimeType?: string | null;
}

interface AssetUploadPostData {
  url: string;
  date: string;
  key: string;
  signature: string;
  algorithm: string;
  policy: string;
  credential: string;
  securityToken?: string | null;
}

interface AssetUploadMutationResponse {
  id: string;
  fileName: string;
  upload: {
    status: string;
    error?: { message: string } | null;
    requestPostData?: AssetUploadPostData | null;
  };
}

interface HygraphGraphQLError {
  message: string;
  extensions?: {
    failedActions?: Array<{
      action: string;
      model: string;
      stage: string;
    }>;
  };
}

interface AssetStatusResponse {
  asset: {
    id: string;
    url: string | null;
    fileName: string;
    mimeType?: string | null;
    upload: { status: string; error?: { message: string } | null };
  } | null;
}

const UPLOAD_COMPLETE_STATUS = "ASSET_UPLOAD_COMPLETE";
const UPLOAD_FAILED_STATUS = "ASSET_ERROR_UPLOAD";

async function hygraphRequest<T>(
  query: string,
  variables: Record<string, unknown> = {},
  token: string,
): Promise<T> {
  const response = await fetch(getHygraphContentEndpoint(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query, variables }),
  });

  const json = (await response.json()) as {
    data?: T;
    errors?: HygraphGraphQLError[];
  };

  if (json.errors?.length) {
    const details = json.errors
      .flatMap((error) => error.extensions?.failedActions ?? [])
      .map((action) => `${action.action} ${action.model} (${action.stage})`)
      .join(", ");
    const suffix = details ? ` — missing: ${details}` : "";
    throw new Error(
      `${json.errors.map((error) => error.message).join("; ")}${suffix}`,
    );
  }

  if (!json.data) {
    throw new Error("Hygraph returned no data");
  }

  return json.data;
}

function assetRequest<T>(
  query: string,
  variables: Record<string, unknown> = {},
): Promise<T> {
  return hygraphRequest(query, variables, getHygraphAssetToken());
}

function siteSettingsRequest<T>(
  query: string,
  variables: Record<string, unknown> = {},
): Promise<T> {
  return hygraphRequest(query, variables, getHygraphContentToken());
}

/** Read published SiteSettings via CDN (no token — asset PAT often lacks read). */
async function publicReadRequest<T>(
  query: string,
  variables: Record<string, unknown> = {},
): Promise<T> {
  const response = await fetch(getHygraphCdnEndpoint(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });

  const json = (await response.json()) as {
    data?: T;
    errors?: HygraphGraphQLError[];
  };

  if (json.errors?.length) {
    throw new Error(json.errors.map((error) => error.message).join("; "));
  }

  if (!json.data) {
    throw new Error("Hygraph returned no data");
  }

  return json.data;
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getSiteSettingsSnapshot(): Promise<{
  id: string;
  resumeId: string | null;
  resumeUrl: string | null;
}> {
  const data = await publicReadRequest<{
    allSiteSettings: {
      id: string;
      resumeUrl: string | null;
      resume: { id: string } | null;
    }[];
  }>(
    `query SiteSettingsSnapshot($slug: String!) {
      allSiteSettings(where: { slug: $slug }, stage: PUBLISHED, first: 1) {
        id
        resumeUrl
        resume { id }
      }
    }`,
    { slug: SITE_SETTINGS_SLUG },
  );

  const site = data.allSiteSettings[0];
  if (!site) {
    throw new Error(`SiteSettings "${SITE_SETTINGS_SLUG}" not found`);
  }

  return {
    id: site.id,
    resumeId: site.resume?.id ?? null,
    resumeUrl: site.resumeUrl ?? null,
  };
}

/** Hygraph asset ids appear as the last segment of graphassets URLs. */
function assetIdFromResumeUrl(resumeUrl: string | null): string | null {
  if (!resumeUrl) return null;
  try {
    const segment = new URL(resumeUrl).pathname.split("/").filter(Boolean).pop();
    if (segment && /^cmp[a-z0-9]+$/i.test(segment)) {
      return segment;
    }
  } catch {
    const segment = resumeUrl.split("/").filter(Boolean).pop();
    if (segment && /^cmp[a-z0-9]+$/i.test(segment)) {
      return segment;
    }
  }
  return null;
}

function isMissingAssetError(message: string): boolean {
  return (
    message.includes("unable to be resolved") ||
    message.includes("not found") ||
    message.includes("does not exist")
  );
}

async function assetExists(assetId: string): Promise<boolean> {
  try {
    const data = await assetRequest<{ asset: { id: string } | null }>(
      `query AssetExists($id: ID!) {
        asset(where: { id: $id }, stage: DRAFT) {
          id
        }
      }`,
      { id: assetId },
    );
    return Boolean(data.asset?.id);
  } catch {
    return false;
  }
}

async function getLinkedResumeAssetId(): Promise<string | null> {
  const { resumeId, resumeUrl } = await getSiteSettingsSnapshot();

  if (resumeId && (await assetExists(resumeId))) {
    return resumeId;
  }

  const fromUrl = assetIdFromResumeUrl(resumeUrl);
  if (fromUrl && (await assetExists(fromUrl))) {
    return fromUrl;
  }

  return null;
}

async function uploadFileToS3(
  post: AssetUploadPostData,
  file: Blob,
  fileName: string,
): Promise<void> {
  const form = new FormData();
  form.append("X-Amz-Date", post.date);
  form.append("key", post.key);
  form.append("X-Amz-Signature", post.signature);
  form.append("X-Amz-Algorithm", post.algorithm);
  form.append("policy", post.policy);
  form.append("X-Amz-Credential", post.credential);
  if (post.securityToken) {
    form.append("X-Amz-Security-Token", post.securityToken);
  }
  form.append("file", file, fileName);

  const response = await fetch(post.url, { method: "POST", body: form });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`S3 upload failed (${response.status}): ${text.slice(0, 200)}`);
  }
}

async function createAssetUpload(
  fileName: string,
): Promise<AssetUploadMutationResponse> {
  const data = await assetRequest<{ createAsset: AssetUploadMutationResponse }>(
    `mutation CreateResumeAsset($fileName: String!) {
      createAsset(data: { fileName: $fileName }) {
        id
        fileName
        upload {
          status
          error { message }
          requestPostData {
            url
            date
            key
            signature
            algorithm
            policy
            credential
            securityToken
          }
        }
      }
    }`,
    { fileName },
  );
  return data.createAsset;
}

async function updateAssetUpload(
  assetId: string,
  fileName: string,
): Promise<AssetUploadMutationResponse> {
  const data = await assetRequest<{ updateAsset: AssetUploadMutationResponse }>(
    `mutation UpdateResumeAsset($id: ID!, $fileName: String!) {
      updateAsset(
        where: { id: $id }
        data: { reUpload: true, fileName: $fileName }
      ) {
        id
        fileName
        upload {
          status
          error { message }
          requestPostData {
            url
            date
            key
            signature
            algorithm
            policy
            credential
            securityToken
          }
        }
      }
    }`,
    { id: assetId, fileName },
  );
  return data.updateAsset;
}

async function requestAssetUpload(
  assetId: string | null,
  fileName: string,
): Promise<AssetUploadMutationResponse> {
  if (!assetId) {
    return createAssetUpload(fileName);
  }

  try {
    return await updateAssetUpload(assetId, fileName);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (isMissingAssetError(message)) {
      return createAssetUpload(fileName);
    }
    throw error;
  }
}

async function fetchAssetSnapshot(
  assetId: string,
  stage: "DRAFT" | "PUBLISHED",
): Promise<AssetStatusResponse["asset"]> {
  const data = await assetRequest<AssetStatusResponse>(
    `query AssetSnapshot($id: ID!, $stage: Stage!) {
      asset(where: { id: $id }, stage: $stage) {
        id
        url
        fileName
        mimeType
        upload {
          status
          error { message }
        }
      }
    }`,
    { id: assetId, stage },
  );
  return data.asset;
}

function pollDelayMs(attempt: number): number {
  return Math.min(POLL_INITIAL_MS + attempt * 150, POLL_MAX_MS);
}

async function waitForDraftReady(
  assetId: string,
  fileName: string,
): Promise<HygraphAsset> {
  let lastStatus: string | undefined;

  for (let attempt = 0; attempt < POLL_MAX_ATTEMPTS; attempt++) {
    const asset = await fetchAssetSnapshot(assetId, "DRAFT");
    if (!asset) {
      throw new Error("Uploaded asset not found");
    }

    const uploadError = asset.upload.error?.message;
    if (uploadError) {
      throw new Error(`Asset processing failed: ${uploadError}`);
    }

    const status = asset.upload.status;
    lastStatus = status;

    if (status === UPLOAD_COMPLETE_STATUS) {
      return {
        id: asset.id,
        url: asset.url ?? "",
        fileName: asset.fileName,
        mimeType: asset.mimeType,
      };
    }

    if (status === UPLOAD_FAILED_STATUS) {
      throw new Error("Asset upload failed during processing");
    }

    await sleep(pollDelayMs(attempt));
  }

  const statusHint = lastStatus ? ` (last status: ${lastStatus})` : "";
  throw new Error(
    `Timed out waiting for "${fileName}" to finish processing${statusHint}. Hygraph can take about a minute — please try again.`,
  );
}

async function publishAndResolveAsset(draft: HygraphAsset): Promise<HygraphAsset> {
  const published = await assetRequest<{
    publishAsset: { id: string; url: string | null; fileName: string };
  }>(
    `mutation PublishResumeAsset($id: ID!) {
      publishAsset(where: { id: $id }, to: PUBLISHED) {
        id
        url
        fileName
      }
    }`,
    { id: draft.id },
  );

  if (published.publishAsset.url) {
    return {
      id: published.publishAsset.id,
      url: published.publishAsset.url,
      fileName: published.publishAsset.fileName,
      mimeType: draft.mimeType,
    };
  }

  for (let attempt = 0; attempt < PUBLISHED_URL_ATTEMPTS; attempt++) {
    const asset = await fetchAssetSnapshot(draft.id, "PUBLISHED");
    if (asset?.url) {
      return {
        id: asset.id,
        url: asset.url,
        fileName: asset.fileName,
        mimeType: asset.mimeType,
      };
    }
    await sleep(PUBLISHED_URL_MS);
  }

  return draft;
}

/** Upload file to Hygraph storage and publish the asset. */
export async function uploadResumeAsset(
  file: Blob,
  fileName: string,
): Promise<HygraphAsset> {
  const mimeType = file.type || "application/pdf";
  const existingAssetId = await getLinkedResumeAssetId();

  const draft = await requestAssetUpload(existingAssetId, fileName);
  const uploadError = draft.upload.error?.message;
  if (uploadError) {
    throw new Error(uploadError);
  }

  const post = draft.upload.requestPostData;
  if (!post) {
    throw new Error("Hygraph did not return upload credentials");
  }

  const blob =
    file instanceof Blob && file.type
      ? file
      : new Blob([await file.arrayBuffer()], { type: mimeType });

  await uploadFileToS3(post, blob, fileName);
  const ready = await waitForDraftReady(draft.id, fileName);
  return publishAndResolveAsset(ready);
}

/** Point Site Settings at the published asset URL (no Asset↔SiteSettings relation needed). */
export async function connectAndPublishResume(asset: HygraphAsset): Promise<void> {
  const { id: settingsId } = await getSiteSettingsSnapshot();

  if (!asset.url) {
    throw new Error("Published asset has no URL yet. Wait a moment and try again.");
  }

  await siteSettingsRequest(
    `mutation SetResumeUrl($id: ID!, $resumeUrl: String!) {
      updateSiteSettings(
        where: { id: $id }
        data: { resumeUrl: $resumeUrl }
      ) {
        id
        resumeUrl
      }
    }`,
    { id: settingsId, resumeUrl: asset.url },
  );

  await siteSettingsRequest(
    `mutation PublishSiteSettings($id: ID!) {
      publishSiteSettings(where: { id: $id }, to: PUBLISHED) {
        id
        resumeUrl
        resume { id url fileName }
      }
    }`,
    { id: settingsId },
  );
}

/** Full vault flow: upload → publish asset → wire Site Settings → publish settings. */
export async function publishResumeToPortfolio(
  file: Blob,
  fileName: string,
): Promise<HygraphAsset> {
  const asset = await uploadResumeAsset(file, fileName);
  await connectAndPublishResume(asset);
  return asset;
}
