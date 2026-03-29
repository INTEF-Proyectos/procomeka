import { mkdir, rm, access, readFile } from "node:fs/promises";
import path from "node:path";

import { parseContentXml } from "@procomeka/db/elpx-metadata";
import type { ElpxMetadata } from "@procomeka/db/elpx-metadata";

export type { ElpxMetadata };

export type ElpxProcessResult = {
  hash: string;
  extractPath: string;
  hasPreview: boolean;
  metadata: ElpxMetadata;
};

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function validateElpxFile(filePath: string): Promise<void> {
  if (!(await fileExists(filePath))) {
    throw new Error("El archivo no existe");
  }

  // Validate ZIP structure by scanning the raw bytes for entry names.
  // We avoid subprocess calls (unzip) because Bun's test runner captures stdout.
  let zipBytes: Buffer;
  try {
    zipBytes = await readFile(filePath);
  } catch {
    throw new Error("No se puede leer el archivo");
  }

  // Quick ZIP signature check (PK\x03\x04)
  if (zipBytes.length < 4 || zipBytes[0] !== 0x50 || zipBytes[1] !== 0x4b) {
    throw new Error("El archivo no es un ZIP válido");
  }

  const zipText = zipBytes.toString("latin1");
  const hasContentV3 = zipText.includes("contentv3.xml");
  const hasContent = zipText.includes("content.xml");

  if (hasContentV3 && !hasContent) {
    throw new Error(
      "Este archivo fue creado con una versión antigua de eXeLearning. Ábralo con eXeLearning 3.x y guárdelo de nuevo.",
    );
  }

  if (!hasContent) {
    throw new Error(
      "El archivo no es un .elpx válido (no contiene content.xml)",
    );
  }
}

export async function parseElpxMetadata(
  filePath: string,
): Promise<ElpxMetadata> {
  await validateElpxFile(filePath);

  // Extract content.xml from ZIP using Bun's JSZip-compatible API or fallback
  const zipBuffer = await readFile(filePath);
  const blob = new Blob([zipBuffer]);
  const zipResponse = new Response(blob);
  // Use Bun.spawn with quiet fallback — but capture via different method
  const tempDir = path.join(
    (await import("node:os")).tmpdir(),
    `elpx-parse-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  );
  await mkdir(tempDir, { recursive: true });

  try {
    const proc = Bun.spawn(["unzip", "-o", "-q", filePath, "content.xml", "-d", tempDir], {
      stdout: "ignore",
      stderr: "ignore",
    });
    await proc.exited;

    const contentPath = path.join(tempDir, "content.xml");
    if (!(await fileExists(contentPath))) {
      throw new Error("El archivo no es un .elpx válido (no contiene content.xml)");
    }

    const xml = await Bun.file(contentPath).text();
    return parseContentXml(xml);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}

export function buildElpxPath(baseDir: string, hash: string): string {
  return path.join(baseDir, "elpx", hash);
}

export async function processElpxUpload(
  filePath: string,
  baseDir: string,
  opts?: { hash?: string },
): Promise<ElpxProcessResult> {
  const metadata = await parseElpxMetadata(filePath);

  // Use provided hash or generate a unique one
  const hash = opts?.hash ?? crypto.randomUUID();

  const extractPath = buildElpxPath(baseDir, hash);
  await mkdir(extractPath, { recursive: true });

  // Extract ZIP
  const proc = Bun.spawn(["unzip", "-o", filePath, "-d", extractPath], {
    stdout: "pipe",
    stderr: "pipe",
  });
  const exitCode = await proc.exited;

  if (exitCode !== 0) {
    throw new Error("Error al extraer el archivo .elpx");
  }

  const hasPreview = await fileExists(path.join(extractPath, "index.html"));

  return { hash, extractPath, hasPreview, metadata };
}

export async function removeElpxExtraction(
  extractPath: string,
): Promise<void> {
  await rm(extractPath, { recursive: true, force: true });
}
