const { build } = require("esbuild");

Promise.all([
    build({
        entryPoints: {
            background: "src/background.ts",
            popup: "src/popup.ts",
            existingRules: "src/existingRules.ts"
        },
        bundle: true,
        outdir: "dist",
        format: "esm",
        sourcemap: true,
        target: "es2020"
    }),

    build({
        entryPoints: {
            content: "src/content.ts"
        },
        bundle: true,
        outdir: "dist",
        format: "iife",
        sourcemap: true
    })
]);