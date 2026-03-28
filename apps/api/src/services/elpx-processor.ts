import { createHash } from "node:crypto";
import { mkdir, rm, access } from "node:fs/promises";
import path from "node:path";

export type ElpxMetadata = {
  title: string;
  description: string;
  author: string;
  license: string;
  language: string;
  learningResourceType: string;
};

export type ElpxProcessResult = {
  hash: string;
  extractPath: string;
  hasPreview: boolean;
  metadata: ElpxMetadata;
};

const METADATA_KEYS: Record<string, keyof ElpxMetadata> = {
  pp_title: "title",
  pp_description: "description",
  pp_author: "author",
  license: "license",
  lom_general_language: "language",
  pp_learningResourceType: "learningResourceType",
};

function emptyMetadata(): ElpxMetadata {
  return {
    title: "",
    description: "",
    author: "",
    license: "",
    language: "",
    learningResourceType: "",
  };
}

function parseContentXml(xml: string): ElpxMetadata {
  const metadata = emptyMetadata();

  const propertyRegex =
    /<odeProperty>\s*<key>(.*?)<\/key>\s*<value>(.*?)<\/value>\s*<\/odeProperty>/gs;

  let match: RegExpExecArray | null;
  while ((match = propertyRegex.exec(xml)) !== null) {
    const key = match[1]?.trim() ?? "";
    const value = match[2]?.trim() ?? "";
    const field = METADATA_KEYS[key];
    if (field) {
      metadata[field] = value;
    }
  }

  return metadata;
}

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

  // List ZIP contents to validate structure
  const listProc = Bun.spawn(["unzip", "-l", filePath], {
    stdout: "pipe",
    stderr: "pipe",
  });
  const listOutput = await new Response(listProc.stdout).text();
  const exitCode = await listProc.exited;

  if (exitCode !== 0) {
    throw new Error("El archivo no es un ZIP válido");
  }

  const hasContentV3 = listOutput.includes("contentv3.xml");
  const hasContent = listOutput.includes("content.xml");

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

  // Read content.xml from ZIP without extracting
  const proc = Bun.spawn(["unzip", "-p", filePath, "content.xml"], {
    stdout: "pipe",
    stderr: "pipe",
  });
  const xml = await new Response(proc.stdout).text();
  const exitCode = await proc.exited;

  if (exitCode !== 0) {
    throw new Error(
      "El archivo no es un .elpx válido (no contiene content.xml)",
    );
  }

  return parseContentXml(xml);
}

export function buildElpxPath(baseDir: string, hash: string): string {
  return path.join(baseDir, "elpx", hash);
}

export async function processElpxUpload(
  filePath: string,
  baseDir: string,
): Promise<ElpxProcessResult> {
  const metadata = await parseElpxMetadata(filePath);

  const hash = createHash("sha1")
    .update(filePath + Date.now())
    .digest("hex");

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
