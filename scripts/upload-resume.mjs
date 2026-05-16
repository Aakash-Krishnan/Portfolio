/**
 * Uploads resume PDF to Hygraph and publishes it on SiteSettings (slug: main).
 *
 * Usage: pnpm upload-resume
 */

import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function loadEnvFile(filename) {
  const path = resolve(root, filename);
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[trimmed.slice(0, eq).trim()] = value;
  }
}

for (const file of [".env", ".env.development", ".env.local", ".env.development.local"]) {
  loadEnvFile(file);
}

const ENDPOINT =
  process.env.HYGRAPH_CONTENT_ENDPOINT ??
  (process.env.HYGRAPH_ENDPOINT?.includes("cdn.hygraph.com")
    ? "https://api-ap-south-1.hygraph.com/v2/cmox2ikd700nd07w3a7vdmu1c/master"
    : process.env.HYGRAPH_ENDPOINT);
const ASSET_TOKEN = process.env.HYGRAPH_ASSET_TOKEN ?? process.env.HYGRAPH_TOKEN;
const CONTENT_TOKEN = process.env.HYGRAPH_TOKEN;
const CDN_ENDPOINT = process.env.HYGRAPH_ENDPOINT;
const RESUME_FILE =
  process.env.RESUME_FILE ?? resolve(root, "resume/aakash_krishnan_resume.pdf");

if (!ASSET_TOKEN || !CONTENT_TOKEN || !ENDPOINT || !CDN_ENDPOINT) {
  console.error("Missing HYGRAPH_TOKEN, HYGRAPH_ASSET_TOKEN, or endpoints");
  process.exit(1);
}

if (!existsSync(RESUME_FILE)) {
  console.error("Resume file not found:", RESUME_FILE);
  process.exit(1);
}

async function gql(query, variables = {}, token = ASSET_TOKEN) {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors?.length) throw new Error(JSON.stringify(json.errors, null, 2));
  return json.data;
}

async function cdnRead(query, variables = {}) {
  const res = await fetch(CDN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors?.length) throw new Error(JSON.stringify(json.errors, null, 2));
  return json.data;
}

async function uploadToS3(post, buffer, fileName) {
  const form = new FormData();
  form.append("X-Amz-Date", post.date);
  form.append("key", post.key);
  form.append("X-Amz-Signature", post.signature);
  form.append("X-Amz-Algorithm", post.algorithm);
  form.append("policy", post.policy);
  form.append("X-Amz-Credential", post.credential);
  if (post.securityToken) form.append("X-Amz-Security-Token", post.securityToken);
  form.append("file", new Blob([buffer], { type: "application/pdf" }), fileName);

  const res = await fetch(post.url, { method: "POST", body: form });
  if (!res.ok) throw new Error(`S3 upload failed: ${res.status} ${await res.text()}`);
}

async function main() {
  const fileName = RESUME_FILE.split("/").pop();
  const buffer = readFileSync(RESUME_FILE);

  const linked = await cdnRead(
    `{ allSiteSettings(where: { slug: "main" }, stage: PUBLISHED, first: 1) { id resumeUrl resume { id } } }`,
  );
  const site = linked.allSiteSettings[0];
  const settingsId = site?.id;
  const resumeUrl = site?.resumeUrl ?? null;
  let existingAssetId = site?.resume?.id ?? null;

  async function assetExists(id) {
    try {
      const r = await gql(
        `query($id: ID!) { asset(where: { id: $id }, stage: DRAFT) { id } }`,
        { id },
        ASSET_TOKEN,
      );
      return Boolean(r.asset?.id);
    } catch {
      return false;
    }
  }

  if (existingAssetId && !(await assetExists(existingAssetId))) {
    existingAssetId = null;
  }
  if (!existingAssetId && resumeUrl) {
    const fromUrl = resumeUrl.split("/").filter(Boolean).pop();
    if (fromUrl?.match(/^cmp[a-z0-9]+$/i) && (await assetExists(fromUrl))) {
      existingAssetId = fromUrl;
    }
  }

  console.log(existingAssetId ? "Updating existing asset…" : "Creating asset…");
  let mutation = existingAssetId
    ? `mutation($id: ID!, $fileName: String!) {
        updateAsset(where: { id: $id }, data: { reUpload: true, fileName: $fileName }) {
          id upload { requestPostData { url date key signature algorithm policy credential securityToken } }
        }
      }`
    : `mutation($fileName: String!) {
        createAsset(data: { fileName: $fileName }) {
          id upload { requestPostData { url date key signature algorithm policy credential securityToken } }
        }
      }`;

  let created;
  try {
    created = await gql(
      mutation,
      existingAssetId ? { id: existingAssetId, fileName } : { fileName },
      ASSET_TOKEN,
    );
  } catch (error) {
    const msg = String(error);
    if (!existingAssetId || !msg.includes("unable to be resolved")) throw error;
    console.log("Stale resume asset id — creating a new asset…");
    mutation = `mutation($fileName: String!) {
      createAsset(data: { fileName: $fileName }) {
        id upload { requestPostData { url date key signature algorithm policy credential securityToken } }
      }
    }`;
    created = await gql(mutation, { fileName }, ASSET_TOKEN);
    existingAssetId = null;
  }
  const assetNode = existingAssetId ? created.updateAsset : created.createAsset;
  const post = assetNode.upload.requestPostData;
  if (!post) throw new Error("No upload credentials");

  console.log("Uploading to storage…");
  await uploadToS3(post, buffer, fileName);

  console.log("Waiting for processing (can take ~60s)…");
  let lastStatus;
  for (let i = 0; i < 90; i++) {
    const status = await gql(
      `query($id: ID!) { asset(where: { id: $id }, stage: DRAFT) { url fileName upload { status error { message } } } }`,
      { id: assetNode.id },
      ASSET_TOKEN,
    );
    const upload = status.asset?.upload;
    if (upload?.error?.message) throw new Error(upload.error.message);
    lastStatus = upload?.status;
    if (upload?.status === "ASSET_UPLOAD_COMPLETE") {
      assetNode.url = status.asset?.url ?? assetNode.url;
      break;
    }
    if (upload?.status === "ASSET_ERROR_UPLOAD") {
      throw new Error("Asset upload failed during processing");
    }
    await new Promise((r) => setTimeout(r, Math.min(500 + i * 150, 1500)));
    if (i === 89) {
      throw new Error(
        `Timed out waiting for asset processing${lastStatus ? ` (last status: ${lastStatus})` : ""}`,
      );
    }
  }

  console.log("Publishing asset…");
  const pub = await gql(
    `mutation($id: ID!) { publishAsset(where: { id: $id }, to: PUBLISHED) { id url fileName } }`,
    { id: assetNode.id },
    ASSET_TOKEN,
  );
  const publishedUrl = pub.publishAsset?.url ?? assetNode.url;
  if (!publishedUrl) throw new Error("Published asset has no URL");

  if (!settingsId) throw new Error("SiteSettings not found");

  console.log("Setting resume URL on Site Settings…");
  await gql(
    `mutation($id: ID!, $resumeUrl: String!) {
      updateSiteSettings(where: { id: $id }, data: { resumeUrl: $resumeUrl }) { id resumeUrl }
    }`,
    { id: settingsId, resumeUrl: publishedUrl },
    CONTENT_TOKEN,
  );

  console.log("Publishing Site Settings…");
  const published = await gql(
    `mutation($id: ID!) {
      publishSiteSettings(where: { id: $id }, to: PUBLISHED) { id resumeUrl resume { url fileName } }
    }`,
    { id: settingsId },
    CONTENT_TOKEN,
  );

  console.log("Done.", published.publishSiteSettings?.resume);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
