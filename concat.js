const concat = require('concat');
const fs = require('fs');
const package = require('./package.json');

function copyDirectory(source, destination) {
    if (!source.endsWith("/")) { source += '/'; }
    if (!destination.endsWith("/")) { destination += '/'; }
    if (!fs.existsSync(destination)) {
        fs.mkdirSync(destination);
    }

    const files = fs.readdirSync(source);
    files.forEach(file => {
        const srcPath = `${source}${file}`;
        const destPath = `${destination}${file}`;

        if (fs.lstatSync(srcPath).isDirectory()) {
            copyDirectory(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    });
}

async function mergeJsFiles(libPath, jsFiles) {
    if (fs.existsSync(libPath)) {
        fs.rmSync(libPath, { recursive: true })
    }
    fs.mkdirSync(libPath, { recursive: true });
    await concat(jsFiles, `${libPath}/ca-chat-container.js`);
}

(async () => {
    const libPath = `./dist/`;
    const jsFiles = [
        `./private/${package.name}/runtime.js`,
        `./private/${package.name}/polyfills.js`,
        `./private/${package.name}/scripts.js`,
        `./private/${package.name}/main.js`
    ];

    mergeJsFiles(libPath, jsFiles);
    copyDirectory(`./private/${package.name}/assets/`, libPath + 'assets/');
})();