// Makes the copy of the app that gets published: the same files, with the scripts shrunk and their inner names scrambled.
// That makes the app load faster on slow data and much harder to read or copy.
//
//   npm install        (once)
//   npm run build      (writes the ready-to-publish copy into the "dist" folder)
//   npm run deploy     (builds, then publishes "dist" to Netlify)
//
// If anything cannot be shrunk, that one file is copied as it is, so a build never leaves the app broken.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = __dirname;
const OUT = path.join(ROOT, 'dist');

// What gets published (the build script, notes and tooling stay home)
const FILES = [
    'index.html', 'admin.html', 'style.css', 'admin.css', 'manifest.json',
    'app.js', 'db.js', 'camera.js', 'nudges.js', 'admin.js', 'serviceworker.js',
    'config.js', 'firebase-init.js', 'admin-init.js'
];
const FOLDERS = ['icons'];
const MODULES = new Set(['firebase-init.js', 'admin-init.js']); // loaded with type="module"
const KEEP_AS_WRITTEN = new Set(['config.js']); // you edit this one by hand

let terser = null;
try { terser = require('terser'); } catch (error) { console.warn('Note: "terser" is not installed (run: npm install). Files will be copied without shrinking.'); }

function copyFolder(from, to) {
    fs.mkdirSync(to, { recursive: true });
    for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
        const source = path.join(from, entry.name);
        const target = path.join(to, entry.name);
        if (entry.isDirectory()) copyFolder(source, target);
        else fs.copyFileSync(source, target);
    }
}

// A short code that changes whenever any published file changes. The published service worker uses it as its cache name, so every build is a new version
// on people's phones even if the version number in serviceworker.js was forgotten (that was the other way an old version could stay on a phone).
function versionStamp() {
    const hash = crypto.createHash('sha1');
    const add = (p) => {
        if (fs.statSync(p).isDirectory()) fs.readdirSync(p).sort().forEach(entry => add(path.join(p, entry)));
        else { hash.update(path.relative(ROOT, p)); hash.update(fs.readFileSync(p)); }
    };
    FILES.filter(name => name !== 'serviceworker.js').concat(FOLDERS).forEach(name => { const p = path.join(ROOT, name); if (fs.existsSync(p)) add(p); });
    const worker = path.join(ROOT, 'serviceworker.js'); // (the worker's own code counts too, but not its cache name: that is what this code becomes)
    if (fs.existsSync(worker)) hash.update(fs.readFileSync(worker, 'utf8').replace(/(const CACHE_NAME = ')[^']*(')/, '$1$2'));
    return hash.digest('hex').slice(0, 10);
}

async function main() {
    fs.rmSync(OUT, { recursive: true, force: true });
    fs.mkdirSync(OUT, { recursive: true });

    const stamp = versionStamp();
    let before = 0;
    let after = 0;
    for (const name of FILES) {
        const source = path.join(ROOT, name);
        if (!fs.existsSync(source)) { console.warn(`Skipped (not found): ${name}`); continue; }
        let text = fs.readFileSync(source, 'utf8');
        if (name === 'serviceworker.js') {
            const stamped = text.replace(/(const CACHE_NAME = ')[^']*(')/, `$1pika-shot-cache-${stamp}$2`);
            if (stamped === text) console.warn('Note: the cache name in serviceworker.js was not found, so it was not stamped.');
            text = stamped;
        }
        let result = text;
        if (terser && name.endsWith('.js') && !KEEP_AS_WRITTEN.has(name)) {
            try {
                const min = await terser.minify(text, {
                    module: MODULES.has(name),
                    compress: { passes: 2, drop_debugger: true },
                    mangle: true, // inner names only: the app's own method names and globals (DB, Camera, ...) are left alone
                    format: { comments: false }
                });
                if (min.code && min.code.length > 0) result = min.code;
            } catch (error) {
                console.warn(`Could not shrink ${name}, copied as it is: ${error.message}`);
            }
        }
        fs.writeFileSync(path.join(OUT, name), result);
        before += Buffer.byteLength(text);
        after += Buffer.byteLength(result);
    }
    for (const folder of FOLDERS) if (fs.existsSync(path.join(ROOT, folder))) copyFolder(path.join(ROOT, folder), path.join(OUT, folder));

    // Netlify reads these from the published folder
    fs.copyFileSync(path.join(ROOT, 'netlify.toml'), path.join(OUT, 'netlify.toml'));

    console.log(`Built "dist": ${(before / 1024).toFixed(0)} KB -> ${(after / 1024).toFixed(0)} KB (version pika-shot-cache-${stamp})`);
}

main().catch((error) => { console.error('Build failed:', error); process.exit(1); });
