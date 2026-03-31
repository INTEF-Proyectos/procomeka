import { mkdir, rm, copyFile, writeFile } from "node:fs/promises";
import path from "node:path";
import os from "node:os";

export type GeneratorFileEntry = {
	filename: string;
	filePath: string;
};

function escapeXml(str: string): string {
	return str
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&apos;");
}

function escapeHtml(str: string): string {
	return str
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;");
}

function generateId(): string {
	const now = new Date();
	const ts = [
		now.getUTCFullYear(),
		String(now.getUTCMonth() + 1).padStart(2, "0"),
		String(now.getUTCDate()).padStart(2, "0"),
		String(now.getUTCHours()).padStart(2, "0"),
		String(now.getUTCMinutes()).padStart(2, "0"),
		String(now.getUTCSeconds()).padStart(2, "0"),
	].join("");
	const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
	return `${ts}${rand}`;
}

function buildContentXml(title: string, author: string, language: string, license: string, files: GeneratorFileEntry[]): string {
	const pageId = generateId();
	const blockId = generateId();
	const ideviceId = generateId();

	const linksHtml = files
		.map((f) => `<li><a href="${escapeHtml(f.filename)}">${escapeHtml(f.filename)}</a></li>`)
		.join("");
	const listHtml = `<ul>${linksHtml}</ul>`;

	// JSON-encode the HTML for the jsonProperties CDATA block
	const textTextarea = JSON.stringify(listHtml);

	const htmlViewContent = `<div class="exe-text-template"><div class="textIdeviceContent"><div class="exe-text-activity"><div>${listHtml}</div></div></div></div>`;

	return `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE ode SYSTEM "content.dtd">
<ode xmlns="http://www.intef.es/xsd/ode" version="2.0">
  <odeProperties>
    <odeProperty><key>pp_title</key><value>${escapeXml(title)}</value></odeProperty>
    <odeProperty><key>pp_description</key><value></value></odeProperty>
    <odeProperty><key>pp_author</key><value>${escapeXml(author)}</value></odeProperty>
    <odeProperty><key>license</key><value>${escapeXml(license)}</value></odeProperty>
    <odeProperty><key>lom_general_language</key><value>${escapeXml(language)}</value></odeProperty>
    <odeProperty><key>pp_learningResourceType</key><value></value></odeProperty>
  </odeProperties>
  <odeNavStructures>
    <odeNavStructure>
      <odePageId>${pageId}</odePageId>
      <odeParentPageId/>
      <pageName>${escapeXml(title)}</pageName>
      <odeNavStructureOrder>1</odeNavStructureOrder>
      <odeNavStructureProperties>
        <odeNavStructureProperty><key>titleNode</key><value>${escapeXml(title)}</value></odeNavStructureProperty>
        <odeNavStructureProperty><key>visibility</key><value>true</value></odeNavStructureProperty>
      </odeNavStructureProperties>
      <odePagStructures>
        <odePagStructure>
          <odePageId>${pageId}</odePageId>
          <odeBlockId>${blockId}</odeBlockId>
          <blockName>Texto</blockName>
          <iconName/>
          <odePagStructureOrder>1</odePagStructureOrder>
          <odePagStructureProperties>
            <odePagStructureProperty><key>visibility</key><value>true</value></odePagStructureProperty>
            <odePagStructureProperty><key>teacherOnly</key><value>false</value></odePagStructureProperty>
          </odePagStructureProperties>
          <odeComponents>
            <odeComponent>
              <odePageId>${pageId}</odePageId>
              <odeBlockId>${blockId}</odeBlockId>
              <odeIdeviceId>${ideviceId}</odeIdeviceId>
              <odeIdeviceTypeName>text</odeIdeviceTypeName>
              <htmlView><![CDATA[${htmlViewContent}]]></htmlView>
              <jsonProperties><![CDATA[{"ideviceId":${JSON.stringify(ideviceId)},"textInfoDurationInput":"","textInfoDurationTextInput":"Duración","textInfoParticipantsInput":"","textInfoParticipantsTextInput":"Agrupamiento","textTextarea":${textTextarea},"textFeedbackInput":"Show Feedback","textFeedbackTextarea":""}]]></jsonProperties>
              <odeComponentsOrder>1</odeComponentsOrder>
              <odeComponentsProperties>
                <odeComponentsProperty><key>visibility</key><value>true</value></odeComponentsProperty>
                <odeComponentsProperty><key>teacherOnly</key><value>false</value></odeComponentsProperty>
                <odeComponentsProperty><key>identifier</key><value/></odeComponentsProperty>
                <odeComponentsProperty><key>cssClass</key><value/></odeComponentsProperty>
              </odeComponentsProperties>
            </odeComponent>
          </odeComponents>
        </odePagStructure>
      </odePagStructures>
    </odeNavStructure>
  </odeNavStructures>
</ode>`;
}

function buildIndexHtml(title: string, files: GeneratorFileEntry[]): string {
	const links = files
		.map((f) => `    <li><a href="${escapeHtml(f.filename)}">${escapeHtml(f.filename)}</a></li>`)
		.join("\n");

	return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <style>
    body { font-family: sans-serif; max-width: 800px; margin: 2rem auto; padding: 0 1rem; }
    h1 { font-size: 1.5rem; margin-bottom: 0.5rem; }
    ul { line-height: 2; }
    a { color: #005fa3; }
  </style>
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  <p>Este recurso contiene los siguientes archivos:</p>
  <ul>
${links}
  </ul>
</body>
</html>`;
}

/**
 * Ensures all filenames in the list are unique by appending a numeric suffix when needed.
 * Returns a new list with unique filenames.
 */
function deduplicateFilenames(files: GeneratorFileEntry[]): GeneratorFileEntry[] {
	const seen = new Map<string, number>();
	return files.map((f) => {
		const lower = f.filename.toLowerCase();
		const count = seen.get(lower) ?? 0;
		seen.set(lower, count + 1);
		if (count === 0) return f;
		const ext = path.extname(f.filename);
		const base = path.basename(f.filename, ext);
		return { ...f, filename: `${base}-${count}${ext}` };
	});
}

/**
 * Generates an .elpx ZIP package from a list of educational files.
 *
 * The resulting package:
 * - Contains a `content.xml` with minimal eXeLearning metadata (parseable by parseContentXml).
 * - Contains an `index.html` with relative links to all bundled files.
 * - Bundles all provided files in the ZIP root.
 * - Is compatible with processElpxUpload and the existing pipeline.
 *
 * @param opts.title      Resource title (used in metadata and index page)
 * @param opts.author     Resource author (optional)
 * @param opts.language   ISO 639-1 language code, defaults to "es"
 * @param opts.license    License identifier, defaults to "cc-by"
 * @param opts.files      List of files to bundle (each must have a local filePath)
 * @param opts.outputPath Absolute path where the resulting .elpx ZIP will be written
 */
export async function generateElpxFromFiles(opts: {
	title: string;
	author?: string;
	language?: string;
	license?: string;
	files: GeneratorFileEntry[];
	outputPath: string;
}): Promise<void> {
	const { title, author = "", language = "es", license = "cc-by", outputPath } = opts;
	const files = deduplicateFilenames(opts.files);

	const workDir = path.join(
		os.tmpdir(),
		`procomeka-gen-${Date.now()}-${Math.random().toString(36).slice(2)}`,
	);
	await mkdir(workDir, { recursive: true });

	try {
		// Write generated files to workdir
		await writeFile(path.join(workDir, "content.xml"), buildContentXml(title, author, language, license, files), "utf8");
		await writeFile(path.join(workDir, "index.html"), buildIndexHtml(title, files), "utf8");

		// Copy media files to workdir
		for (const f of files) {
			await copyFile(f.filePath, path.join(workDir, f.filename));
		}

		// Build ZIP: use -j to junk directory paths (all files in root)
		const allFiles = ["content.xml", "index.html", ...files.map((f) => f.filename)];
		const proc = Bun.spawn(
			["zip", "-j", outputPath, ...allFiles.map((name) => path.join(workDir, name))],
			{ stdout: "ignore", stderr: "pipe" },
		);
		const exitCode = await proc.exited;
		if (exitCode !== 0) {
			const stderr = await new Response(proc.stderr).text();
			throw new Error(`Error al crear el paquete .elpx: ${stderr.trim()}`);
		}
	} finally {
		await rm(workDir, { recursive: true, force: true });
	}
}
