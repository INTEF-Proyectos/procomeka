/**
 * Generador de archivos .elpx para los recursos de demo.
 *
 * Estrategia: usa 3 proyectos .elpx reales como plantilla (default, flux, universal).
 * Para cada recurso, elige uno aleatoriamente, modifica content.xml (título, autor,
 * descripción, nombres de páginas, SVG del primer idevice) y re-empaqueta como ZIP.
 */
import { readdir, readFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { ELPX_CONTENT } from "./seed-elpx-content.ts";
import type { SeedResource } from "@procomeka/db/seed-data";

// ---------------------------------------------------------------------------
// Templates — 3 estilos visuales distintos
// ---------------------------------------------------------------------------

const TEMPLATE_FILES = [
	"sample-project-theme-default.elpx",
	"sample-project-theme-flux.elpx",
	"sample-project-theme-universal.elpx",
];

// ---------------------------------------------------------------------------
// Cover SVG themes — colores y etiquetas por recurso
// ---------------------------------------------------------------------------

interface CoverTheme {
	bg: string;
	bg2: string;
	accent: string;
	label: string;
}

const COVER_THEMES: Record<string, CoverTheme> = {
	"res-01": { bg: "#1a1a2e", bg2: "#16213e", accent: "#0f3460", label: "IA y Etica" },
	"res-02": { bg: "#0d1b2a", bg2: "#1b2838", accent: "#1b4965", label: "IA en el Aula" },
	"res-03": { bg: "#212529", bg2: "#343a40", accent: "#0d6efd", label: "Robotica" },
	"res-04": { bg: "#1a1a2e", bg2: "#0f3460", accent: "#533483", label: "IA Academica" },
	"res-05": { bg: "#0b0c10", bg2: "#1f2833", accent: "#45a29e", label: "Desarrollo Agil" },
	"res-06": { bg: "#ffecd2", bg2: "#fcb69f", accent: "#ff6b6b", label: "Robots Amigos" },
	"res-07": { bg: "#667eea", bg2: "#764ba2", accent: "#f093fb", label: "Algoritmos" },
	"res-08": { bg: "#f6d365", bg2: "#fda085", accent: "#e44d26", label: "Cocina Matematica" },
	"res-09": { bg: "#11998e", bg2: "#38ef7d", accent: "#065535", label: "Cambio Climatico" },
	"res-10": { bg: "#4568dc", bg2: "#b06ab3", accent: "#e8d5b7", label: "Fisica" },
	"res-11": { bg: "#ee9ca7", bg2: "#ffdde1", accent: "#c0392b", label: "Geometria" },
	"res-12": { bg: "#2c3e50", bg2: "#3498db", accent: "#ecf0f1", label: "Estadistica" },
	"res-13": { bg: "#0f2027", bg2: "#203a43", accent: "#2c5364", label: "Seguridad Digital" },
	"res-14": { bg: "#a8e063", bg2: "#56ab2f", accent: "#2d6a4f", label: "Pensamiento Comp." },
	"res-15": { bg: "#ff512f", bg2: "#f09819", accent: "#fff3e0", label: "Podcast" },
	"res-16": { bg: "#36d1dc", bg2: "#5b86e5", accent: "#1a237e", label: "Rubricas" },
	"res-17": { bg: "#c94b4b", bg2: "#4b134f", accent: "#f8bbd0", label: "ABP" },
	"res-18": { bg: "#e55d87", bg2: "#5fc3e4", accent: "#fff", label: "Storytelling" },
	"res-19": { bg: "#f7971e", bg2: "#ffd200", accent: "#4a148c", label: "Scratch" },
	"res-20": { bg: "#00b4db", bg2: "#0083b0", accent: "#e0f7fa", label: "Diseno Web" },
	"res-21": { bg: "#373b44", bg2: "#4286f4", accent: "#bbdefb", label: "Machine Learning" },
	"res-22": { bg: "#56ab2f", bg2: "#a8e063", accent: "#1b5e20", label: "Huerto IoT" },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function escapeXml(str: string): string {
	return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// Decorative SVG shapes — picked based on resource index for variety
const DECO_SHAPES = [
	// Circles pattern
	(a: string) => `<circle cx="650" cy="80" r="120" fill="${a}" opacity="0.15"/><circle cx="700" cy="350" r="80" fill="${a}" opacity="0.1"/><circle cx="100" cy="380" r="60" fill="${a}" opacity="0.08"/>`,
	// Diamond grid
	(a: string) => `<rect x="580" y="30" width="100" height="100" rx="8" transform="rotate(45 630 80)" fill="${a}" opacity="0.12"/><rect x="650" y="300" width="70" height="70" rx="6" transform="rotate(45 685 335)" fill="${a}" opacity="0.1"/><rect x="60" y="340" width="50" height="50" rx="4" transform="rotate(45 85 365)" fill="${a}" opacity="0.08"/>`,
	// Triangles
	(a: string) => `<polygon points="700,20 760,140 640,140" fill="${a}" opacity="0.12"/><polygon points="100,350 140,420 60,420" fill="${a}" opacity="0.08"/><polygon points="680,320 720,390 640,390" fill="${a}" opacity="0.1"/>`,
	// Rounded rectangles
	(a: string) => `<rect x="600" y="40" width="160" height="80" rx="20" fill="${a}" opacity="0.12"/><rect x="620" y="320" width="120" height="60" rx="16" fill="${a}" opacity="0.1"/><rect x="40" y="360" width="100" height="50" rx="12" fill="${a}" opacity="0.08"/>`,
	// Dots pattern
	(a: string) => `<circle cx="620" cy="60" r="20" fill="${a}" opacity="0.15"/><circle cx="680" cy="90" r="15" fill="${a}" opacity="0.12"/><circle cx="720" cy="50" r="10" fill="${a}" opacity="0.1"/><circle cx="660" cy="360" r="18" fill="${a}" opacity="0.1"/><circle cx="100" cy="390" r="14" fill="${a}" opacity="0.08"/>`,
	// Hexagons (approximated)
	(a: string) => `<polygon points="660,40 700,20 740,40 740,80 700,100 660,80" fill="${a}" opacity="0.12"/><polygon points="80,340 110,325 140,340 140,370 110,385 80,370" fill="${a}" opacity="0.08"/>`,
];

function generateCoverSvg(resource: SeedResource): string {
	const theme = COVER_THEMES[resource.id] ?? { bg: "#333", bg2: "#555", accent: "#fff", label: "Educacion" };
	const idx = parseInt(resource.id.replace("res-", ""), 10) || 0;
	const decoFn = DECO_SHAPES[idx % DECO_SHAPES.length]!;

	const maxChars = 35;
	const words = resource.title.split(" ");
	const lines: string[] = [];
	let current = "";
	for (const word of words) {
		if ((current + " " + word).trim().length > maxChars && current) {
			lines.push(current.trim());
			current = word;
		} else {
			current = current ? current + " " + word : word;
		}
	}
	if (current) lines.push(current.trim());

	const titleLines = lines.slice(0, 3).map((line, i) =>
		`<text x="400" y="${230 + i * 48}" text-anchor="middle" fill="white" font-family="system-ui, -apple-system, sans-serif" font-size="36" font-weight="700" opacity="0.95">${escapeXml(line)}</text>`
	).join("\n");

	return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450">
<defs>
<linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
<stop offset="0%" style="stop-color:${theme.bg}"/>
<stop offset="100%" style="stop-color:${theme.bg2}"/>
</linearGradient>
</defs>
<rect width="800" height="450" fill="url(#bg)"/>
${decoFn(theme.accent)}
${titleLines}
<rect x="280" y="370" width="240" height="36" rx="18" fill="${theme.accent}" opacity="0.8"/>
<text x="400" y="394" text-anchor="middle" fill="white" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="600">${escapeXml(theme.label)}</text>
</svg>`;
}

/** Map CC license slug to display text */
function licenseText(slug: string): string {
	const map: Record<string, string> = {
		"cc-by": "Creative Commons: Attribution 4.0",
		"cc-by-sa": "Creative Commons: Attribution - Share Alike 4.0",
		"cc-by-nc": "Creative Commons: Attribution - Non Commercial 4.0",
		"cc-by-nc-sa": "Creative Commons: Attribution - Non Commercial - Share Alike 4.0",
		"cc-by-nc-nd": "Creative Commons: Attribution - Non Commercial - No Derivatives 4.0",
		"cc-by-nd": "Creative Commons: Attribution - No Derivatives 4.0",
		"cc0": "Public Domain (CC0)",
	};
	return map[slug] ?? slug;
}

// ---------------------------------------------------------------------------
// Template extraction
// ---------------------------------------------------------------------------

async function extractZipFiles(zipPath: string): Promise<Map<string, Uint8Array>> {
	const { execSync } = require("node:child_process");
	const tmpDir = path.join(require("node:os").tmpdir(), `elpx-tpl-${Date.now()}-${Math.random().toString(36).slice(2)}`);
	execSync(`mkdir -p "${tmpDir}" && unzip -qo "${zipPath}" -d "${tmpDir}"`);

	const files = new Map<string, Uint8Array>();
	async function walk(dir: string, prefix: string) {
		const entries = await readdir(dir, { withFileTypes: true });
		for (const entry of entries) {
			const fullPath = path.join(dir, entry.name);
			const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;
			if (entry.isDirectory()) {
				await walk(fullPath, relativePath);
			} else {
				files.set(relativePath, await readFile(fullPath));
			}
		}
	}
	await walk(tmpDir, "");
	execSync(`rm -rf "${tmpDir}"`);
	return files;
}

// ---------------------------------------------------------------------------
// Content.xml modification
// ---------------------------------------------------------------------------

function modifyContentXml(xml: string, resource: SeedResource, pageNames: string[]): string {
	// Replace metadata values
	let result = xml;

	// Title
	result = result.replace(
		/(<odeProperty>\s*<key>pp_title<\/key>\s*<value>)[^<]*(<\/value>)/,
		`$1${escapeXml(resource.title)}$2`,
	);
	// Author
	result = result.replace(
		/(<odeProperty>\s*<key>pp_author<\/key>\s*<value>)[^<]*(<\/value>)/,
		`$1${escapeXml(resource.author)}$2`,
	);
	// Description
	result = result.replace(
		/(<odeProperty>\s*<key>pp_description<\/key>\s*<value>)[^<]*(<\/value>)/,
		`$1${escapeXml(resource.description)}$2`,
	);
	// Language
	result = result.replace(
		/(<odeProperty>\s*<key>pp_lang<\/key>\s*<value>)[^<]*(<\/value>)/,
		`$1${resource.language}$2`,
	);
	// License
	result = result.replace(
		/(<odeProperty>\s*<key>license<\/key>\s*<value>)[^<]*(<\/value>)/,
		`$1${escapeXml(licenseText(resource.license))}$2`,
	);

	// Replace page names (in order of appearance)
	let pageIdx = 0;
	result = result.replace(/<pageName>[^<]*<\/pageName>/g, (match) => {
		const name = pageNames[pageIdx] ?? `Pagina ${pageIdx + 1}`;
		pageIdx++;
		return `<pageName>${escapeXml(name)}</pageName>`;
	});
	// Also replace titlePage values
	pageIdx = 0;
	result = result.replace(/<key>titlePage<\/key>\s*<value>[^<]*<\/value>/g, (match) => {
		const name = pageNames[pageIdx] ?? `Pagina ${pageIdx + 1}`;
		pageIdx++;
		return `<key>titlePage</key><value>${escapeXml(name)}</value>`;
	});

	// Replace ALL htmlView CDATA blocks with real content
	const pages = ELPX_CONTENT[resource.id] ?? [];
	let hvIdx = 0;
	result = result.replace(/<htmlView><!\[CDATA\[[\s\S]*?\]\]><\/htmlView>/g, () => {
		let html: string;
		if (hvIdx === 0) {
			// First idevice: cover SVG + first page content
			const pageHtml = pages[0]?.html ?? `<h2>${escapeXml(resource.title)}</h2><p>${escapeXml(resource.description)}</p>`;
			html = `<div class="exe-text-template"><div class="textIdeviceContent"><div class="exe-text-activity"><div><p><img src="content/resources/cover.svg" alt="${escapeXml(resource.title)}" style="max-width:100%;height:auto;border-radius:8px;margin-bottom:1.5em" /></p>${pageHtml}</div></div></div></div>`;
		} else {
			// Subsequent idevices: use page content or generate from description
			const page = pages[Math.min(hvIdx, pages.length - 1)];
			const pageContent = page?.html ?? `<h2>${pageNames[hvIdx] ?? "Contenido"}</h2><p>${escapeXml(resource.description)}</p>`;
			html = `<div class="exe-text-template"><div class="textIdeviceContent"><div class="exe-text-activity"><div>${pageContent}</div></div></div></div>`;
		}
		hvIdx++;
		// Wrap in CDATA, escaping ]]> sequences
		const safe = html.replace(/\]\]>/g, "]]]]><![CDATA[>");
		return `<htmlView><![CDATA[${safe}]]></htmlView>`;
	});

	return result;
}

// ---------------------------------------------------------------------------
// HTML modification
// ---------------------------------------------------------------------------

function modifyHtml(html: string, resource: SeedResource, pageContent?: string, isIndex?: boolean): string {
	let result = html;
	// Replace <title>
	result = result.replace(/<title>[^<]*<\/title>/, `<title>${escapeXml(resource.title)}</title>`);
	// Replace all <h1> tags with resource title
	result = result.replace(/<h1>[^<]*<\/h1>/g, `<h1>${escapeXml(resource.title)}</h1>`);
	// Replace meta description
	result = result.replace(
		/<meta name="description" content="[^"]*"/,
		`<meta name="description" content="${escapeXml(resource.description)}"`,
	);
	// Replace inline SVG with "LOREM IPSUM" and all Lorem Ipsum text
	// Strategy: replace the entire SVG element and any Lorem paragraphs
	result = result.replace(/<svg[\s\S]*?<\/svg>/gi, (match) => {
		if (match.includes("LOREM IPSUM") || match.includes("lorem ipsum")) {
			return `<img src="content/resources/cover.svg" alt="${escapeXml(resource.title)}" style="display: block; width: 100%; height: auto; border-radius: 16px;" />`;
		}
		return match; // Keep non-Lorem SVGs (e.g. theme icons)
	});
	// Replace all paragraphs containing Lorem ipsum
	result = result.replace(/<p>[^]*?[Ll]orem ipsum[^]*?<\/p>/g, "");
	// Insert real page content if available
	if (pageContent) {
		const marker = result.indexOf('class="exe-text-activity"');
		if (marker > -1) {
			const divStart = result.indexOf('>', marker) + 1;
			const articleEnd = result.indexOf('</article>', divStart);
			if (divStart > 0 && articleEnd > divStart) {
				result = result.slice(0, divStart) + `<div>${pageContent}</div>` + result.slice(articleEnd);
			}
		}
	}
	return result;
}

// ---------------------------------------------------------------------------
// ZIP creation
// ---------------------------------------------------------------------------

interface ZipEntry { path: string; data: Uint8Array }

function buildZipBuffer(entries: ZipEntry[]): Uint8Array {
	const { deflateRawSync } = require("node:zlib");
	const centralDirectory: Uint8Array[] = [];
	const localFiles: Uint8Array[] = [];
	let offset = 0;

	for (const entry of entries) {
		const nameBytes = new TextEncoder().encode(entry.path);
		const compressed = deflateRawSync(entry.data) as Uint8Array;
		const crc = crc32(entry.data);

		const localHeader = new Uint8Array(30 + nameBytes.length + compressed.length);
		const lv = new DataView(localHeader.buffer);
		lv.setUint32(0, 0x04034b50, true);
		lv.setUint16(4, 20, true);
		lv.setUint16(6, 0, true);
		lv.setUint16(8, 8, true);
		lv.setUint16(10, 0, true);
		lv.setUint16(12, 0, true);
		lv.setUint32(14, crc, true);
		lv.setUint32(18, compressed.length, true);
		lv.setUint32(22, entry.data.length, true);
		lv.setUint16(26, nameBytes.length, true);
		lv.setUint16(28, 0, true);
		localHeader.set(nameBytes, 30);
		localHeader.set(compressed, 30 + nameBytes.length);

		const cdEntry = new Uint8Array(46 + nameBytes.length);
		const cv = new DataView(cdEntry.buffer);
		cv.setUint32(0, 0x02014b50, true);
		cv.setUint16(4, 20, true);
		cv.setUint16(6, 20, true);
		cv.setUint16(8, 0, true);
		cv.setUint16(10, 8, true);
		cv.setUint16(12, 0, true);
		cv.setUint16(14, 0, true);
		cv.setUint32(16, crc, true);
		cv.setUint32(20, compressed.length, true);
		cv.setUint32(24, entry.data.length, true);
		cv.setUint16(28, nameBytes.length, true);
		cv.setUint16(30, 0, true);
		cv.setUint16(32, 0, true);
		cv.setUint16(34, 0, true);
		cv.setUint16(36, 0, true);
		cv.setUint32(38, 0, true);
		cv.setUint32(42, offset, true);
		cdEntry.set(nameBytes, 46);

		localFiles.push(localHeader);
		centralDirectory.push(cdEntry);
		offset += localHeader.length;
	}

	const cdSize = centralDirectory.reduce((s, e) => s + e.length, 0);
	const eocd = new Uint8Array(22);
	const ev = new DataView(eocd.buffer);
	ev.setUint32(0, 0x06054b50, true);
	ev.setUint16(4, 0, true);
	ev.setUint16(6, 0, true);
	ev.setUint16(8, entries.length, true);
	ev.setUint16(10, entries.length, true);
	ev.setUint32(12, cdSize, true);
	ev.setUint32(16, offset, true);
	ev.setUint16(20, 0, true);

	const totalSize = offset + cdSize + 22;
	const result = new Uint8Array(totalSize);
	let pos = 0;
	for (const lf of localFiles) { result.set(lf, pos); pos += lf.length; }
	for (const cd of centralDirectory) { result.set(cd, pos); pos += cd.length; }
	result.set(eocd, pos);
	return result;
}

function crc32(data: Uint8Array): number {
	let crc = 0xFFFFFFFF;
	for (let i = 0; i < data.length; i++) {
		crc ^= data[i]!;
		for (let j = 0; j < 8; j++) {
			crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0);
		}
	}
	return (crc ^ 0xFFFFFFFF) >>> 0;
}

// ---------------------------------------------------------------------------
// Page name generation per resource
// ---------------------------------------------------------------------------

const PAGE_NAMES: Record<string, string[]> = {
	"res-01": ["Introduccion a la IA", "Etica y sesgo algoritmico", "Aplicaciones en el aula", "Debate: privacidad", "Evaluacion", "Recursos adicionales"],
	"res-02": ["IA para docentes", "Herramientas practicas", "Buenas practicas", "Casos de uso", "Evaluacion", "Bibliografia"],
	"res-03": ["Que es un bot", "Taller de montaje", "Programacion basica", "Pruebas y mejoras", "Presentacion", "Galeria"],
	"res-04": ["IA en investigacion", "Busqueda bibliografica", "Analisis de datos", "Etica investigadora", "Practica guiada", "Conclusiones"],
	"res-05": ["Metodologias agiles", "Scrum en 5 minutos", "Asistentes de codigo", "TDD con IA", "Proyecto final", "Retrospectiva"],
	"res-06": ["Hola robots", "Donde hay robots", "Jugamos a ser robots", "El laberinto", "Dibujamos robots", "Cancion robot"],
	"res-07": ["Que es un algoritmo", "Colores y operaciones", "Ordena los pasos", "Encuentra el error", "Crea tu algoritmo", "Reto final"],
	"res-08": ["Fracciones en la cocina", "Receta matematica", "Duplicar y dividir", "Proporciones", "Tu receta", "Exposicion"],
	"res-09": ["Datos del clima", "Cifras clave", "Lee los graficos", "Proyecciones", "Que podemos hacer", "Compromiso"],
	"res-10": ["Conceptos de movimiento", "Caida libre", "Plano inclinado", "Friccion", "Leyes de Newton", "Informe"],
	"res-11": ["Geometria urbana", "Arcos y triangulos", "Paseo fotografico", "Ficha por edificio", "Mural geometrico", "Votacion"],
	"res-12": ["Por que estadistica", "Media y mediana", "Graficos enganosos", "Correlacion", "Analiza una noticia", "Debate"],
	"res-13": ["Tu identidad digital", "Riesgos principales", "10 reglas de oro", "Ciberacoso", "Taller practico", "Compromiso"],
	"res-14": ["Pensamos como ordenador", "Patrones y secuencias", "El laberinto del robot", "Camino mas corto", "Sin ordenador", "Juego final"],
	"res-15": ["Planifica tu podcast", "Guion y estructura", "Grabacion", "Edicion con Audacity", "Publicacion", "Escucha critica"],
	"res-16": ["Que es una rubrica", "Tipos de rubricas", "Disenar una rubrica", "Herramientas digitales", "Practica", "Reflexion"],
	"res-17": ["Que es el ABP", "Pregunta motriz", "Planificacion", "Investigacion", "Creacion", "Presentacion"],
	"res-18": ["Storytelling digital", "Elementos narrativos", "Storyboard", "Imagenes y audio", "Montaje", "Presentacion"],
	"res-19": ["Que es Scratch", "Tu primer programa", "Bucles y eventos", "Variables", "Proyecto libre", "Compartir"],
	"res-20": ["HTML basico", "CSS estilos", "Media queries", "Flexbox", "Tu curriculum", "Publicacion"],
	"res-21": ["Machine Learning", "Aprendizaje supervisado", "Clasificacion", "Redes neuronales", "Herramientas", "Etica ML"],
	"res-22": ["El huerto conectado", "Sensores IoT", "Montaje ESP32", "Recogida de datos", "Graficos y analisis", "Conclusiones"],
};

// ---------------------------------------------------------------------------
// Main generator
// ---------------------------------------------------------------------------

export async function generateDemoElpx(
	resources: SeedResource[],
	outputDir: string,
	log: Pick<typeof console, "log"> = console,
): Promise<Map<string, string>> {
	const templatesDir = "/Users/ernesto/Downloads";

	log.log("  Extrayendo plantillas .elpx (3 temas)...");
	const templates: Map<string, Uint8Array>[] = [];
	for (const tplFile of TEMPLATE_FILES) {
		const tplPath = path.join(templatesDir, tplFile);
		templates.push(await extractZipFiles(tplPath));
	}

	await mkdir(outputDir, { recursive: true });
	const encoder = new TextEncoder();
	const decoder = new TextDecoder();
	const generatedFiles = new Map<string, string>();

	for (const resource of resources) {
		const pages = ELPX_CONTENT[resource.id];
		if (!pages || pages.length === 0) continue;

		// Pick random template
		const tplIdx = Math.floor(Math.random() * templates.length);
		const templateFiles = templates[tplIdx]!;
		const filename = `demo-${resource.slug}.elpx`;
		const outputPath = path.join(outputDir, filename);
		const pageNames = PAGE_NAMES[resource.id] ?? ["Introduccion", "Desarrollo", "Actividades", "Evaluacion", "Recursos", "Creditos"];

		const entries: ZipEntry[] = [];
		let htmlPageIdx = 0;

		for (const [filePath, data] of templateFiles) {
			if (filePath === "content.xml") {
				// Modify content.xml
				const xml = decoder.decode(data);
				const modified = modifyContentXml(xml, resource, pageNames);
				entries.push({ path: filePath, data: encoder.encode(modified) });
			} else if (filePath === "index.html" || filePath.startsWith("html/")) {
				// Modify HTML files — map filename to page content
				const html = decoder.decode(data);
				const pages = ELPX_CONTENT[resource.id] ?? [];
				const isIndex = filePath === "index.html";
				let pageHtml: string | undefined;
				if (isIndex) {
					pageHtml = pages[0]?.html;
				} else {
					htmlPageIdx++;
					const p = pages[Math.min(htmlPageIdx, pages.length - 1)];
					pageHtml = p?.html;
				}
				const modified = modifyHtml(html, resource, pageHtml, isIndex);
				entries.push({ path: filePath, data: encoder.encode(modified) });
			} else {
				// Copy as-is (theme, libs, idevices, etc.)
				entries.push({ path: filePath, data });
			}
		}

		// Add cover SVG
		const coverSvg = generateCoverSvg(resource);
		entries.push({ path: "content/resources/cover.svg", data: encoder.encode(coverSvg) });

		const zipBuffer = buildZipBuffer(entries);
		await writeFile(outputPath, zipBuffer);

		generatedFiles.set(resource.id, filename);
		const themeName = TEMPLATE_FILES[tplIdx]!.replace("sample-project-theme-", "").replace(".elpx", "");
		log.log(`  + ${filename} (tema: ${themeName}, ${Math.round(zipBuffer.length / 1024)} KB)`);
	}

	return generatedFiles;
}
