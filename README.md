# ImageReplacer
A Firefox extension that allows you to replace images across the web

Typescript is compiled to Javascript using:  
`npx tsc`

The content script is bundled using esbuild:  
`npx esbuild src/content.ts --bundle --outfile=dist/content.js`

The background script is excluded from normal compilation, and is compiled using:  
`npx tsc -p tsconfig.background.json`
