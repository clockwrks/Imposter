const esbuild = require('esbuild');
const path = require('path');

esbuild.build({
    entryPoints: [path.join(__dirname, 'src', 'index.ts')],
    bundle: true,
    platform: 'neutral',
    format: 'cjs',
    outfile: path.join(__dirname, 'LocalImpersonator.js'),
    minify: true,
    external: [
        'enmity/api/plugins',
        'enmity/metro',
        'enmity/metro/stores'
    ]
}).catch(() => process.exit(1));
