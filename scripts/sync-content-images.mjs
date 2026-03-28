import fs from "node:fs/promises";
import path from "node:path";

const CONTENT_ROOT = path.resolve("./src/content");
const IMG_BED_URL = process.env.IMG_BED_URL || "https://img.102465.xyz";
const AUTH_CODE = process.env.IMG_BED_AUTH_CODE || process.argv[2] || "";

if (!AUTH_CODE) {
  console.error("Missing auth code. Use IMG_BED_AUTH_CODE=<code> pnpm sync:content-images");
  process.exit(1);
}

const MARKDOWN_EXTENSIONS = new Set([".md", ".mdx"]);
const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".avif"]);
const uploadedCache = new Map();

function isRemoteRef(ref) {
  return /^(https?:)?\/\//i.test(ref) || ref.startsWith("/") || ref.startsWith("data:") || ref.startsWith("#");
}

function normalizeMarkdownPath(filePath) {
  return filePath.split(path.sep).join("/");
}

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(fullPath);
    return fullPath;
  }));
  return files.flat();
}

function collectRefs(content) {
  const refs = [];

  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (frontmatterMatch) {
    const frontmatter = frontmatterMatch[1];
    const imageMatch = frontmatter.match(/^image:\s*["']?([^"'\n]+)["']?\s*$/m);
    if (imageMatch) {
      refs.push({ type: "frontmatter", raw: imageMatch[1] });
    }
  }

  const markdownImageRegex = /!\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
  for (const match of content.matchAll(markdownImageRegex)) {
    refs.push({ type: "markdown", raw: match[1] });
  }

  return refs;
}

async function uploadFile(filePath) {
  const normalized = path.resolve(filePath);
  if (uploadedCache.has(normalized)) return uploadedCache.get(normalized);

  const ext = path.extname(normalized).toLowerCase();
  if (!IMAGE_EXTENSIONS.has(ext)) {
    throw new Error(`Unsupported image type: ${filePath}`);
  }

  const buffer = await fs.readFile(normalized);
  const form = new FormData();
  form.append("file", new Blob([buffer]), path.basename(normalized));

  const response = await fetch(`${IMG_BED_URL}/upload`, {
    method: "POST",
    headers: { authCode: AUTH_CODE },
    body: form,
  });

  if (!response.ok) {
    throw new Error(`Upload failed (${response.status}) for ${filePath}: ${await response.text()}`);
  }

  const data = await response.json();
  const src = data?.[0]?.src;
  if (!src) {
    throw new Error(`Upload succeeded but no src returned for ${filePath}`);
  }

  const finalUrl = new URL(src, IMG_BED_URL).toString();
  uploadedCache.set(normalized, finalUrl);
  return finalUrl;
}

async function syncMarkdownFile(filePath) {
  const original = await fs.readFile(filePath, "utf8");
  const refs = collectRefs(original).filter((ref) => !isRemoteRef(ref.raw));

  if (refs.length === 0) {
    return { changed: false, uploads: [] };
  }

  let updated = original;
  const uploads = [];

  for (const ref of refs) {
    const resolved = path.resolve(path.dirname(filePath), ref.raw);
    try {
      await fs.access(resolved);
    } catch {
      console.warn(`Skip missing file: ${normalizeMarkdownPath(path.relative(process.cwd(), resolved))}`);
      continue;
    }

    const uploadedUrl = await uploadFile(resolved);
    uploads.push({ local: resolved, remote: uploadedUrl });

    if (ref.type === "frontmatter") {
      const escaped = ref.raw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      updated = updated.replace(new RegExp(`(^image:\\s*["']?)${escaped}(["']?\\s*$)`, "m"), `$1${uploadedUrl}$2`);
    } else {
      updated = updated.split(`](${ref.raw})`).join(`](${uploadedUrl})`);
    }
  }

  if (updated !== original) {
    await fs.writeFile(filePath, updated, "utf8");
    return { changed: true, uploads };
  }

  return { changed: false, uploads };
}

const markdownFiles = (await walk(CONTENT_ROOT)).filter((file) => MARKDOWN_EXTENSIONS.has(path.extname(file).toLowerCase()));

let changedCount = 0;
let uploadCount = 0;

for (const file of markdownFiles) {
  const result = await syncMarkdownFile(file);
  if (result.changed) {
    changedCount += 1;
    console.log(`Updated ${normalizeMarkdownPath(path.relative(process.cwd(), file))}`);
  }
  uploadCount += result.uploads.length;
}

console.log(`Done. Updated ${changedCount} markdown file(s), uploaded ${uploadCount} image reference(s).`);
