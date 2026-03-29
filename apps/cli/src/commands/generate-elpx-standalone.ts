/**
 * Genera los 22 .elpx de demo sin ejecutar el seed completo.
 * Usado por extract-elpx-for-static.ts cuando los .elpx no existen (CI).
 */
import path from "node:path";
import { DEMO_RESOURCES } from "@procomeka/db/seed-data";
import { generateDemoElpx } from "./generate-elpx.ts";

const repoRoot = path.resolve(import.meta.dir, "../../../..");
const outputDir = path.join(repoRoot, "apps/api/src/test-fixtures/elpx/demo");

await generateDemoElpx(DEMO_RESOURCES, outputDir);
