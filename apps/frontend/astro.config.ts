import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import { paraglideVitePlugin } from "@inlang/paraglide-js";

const isPreview = process.env.PREVIEW_STATIC === "true";
const previewBase = process.env.PREVIEW_BASE ?? "/";

export default defineConfig({
	site: isPreview ? "https://intef-proyectos.github.io" : "https://procomeka.es",
	base: isPreview ? previewBase : "/",
	output: "static",
	integrations: [react()],
	i18n: {
		defaultLocale: "es",
		locales: ["es", "en", "ca", "gl", "eu"],
		routing: {
			prefixDefaultLocale: false,
		},
	},
	vite: {
		plugins: [
			paraglideVitePlugin({
				project: "./project.inlang",
				outdir: "./src/paraglide",
				strategy: ["url", "baseLocale"],
				urlPatterns: [
					{
						pattern: "/:path(.*)?",
						localized: [
							["es", "/:path(.*)?"],
							["en", "/en/:path(.*)?"],
							["ca", "/ca/:path(.*)?"],
							["gl", "/gl/:path(.*)?"],
							["eu", "/eu/:path(.*)?"],
						],
					},
				],
			}),
		],
		define: {
			"import.meta.env.PUBLIC_PREVIEW_MODE": JSON.stringify(isPreview ? "true" : "false"),
		},
		server: isPreview
			? {}
			: {
					proxy: {
						"/api": {
							target: "http://localhost:3000",
							changeOrigin: true,
						},
					},
				},
		optimizeDeps: {
			exclude: ["@electric-sql/pglite"],
		},
	},
});
