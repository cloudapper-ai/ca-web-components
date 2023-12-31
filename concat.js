const concat = require('concat');
const fs = require('fs');
const package = require('./package.json');

(async ()=> { 
    const libPath = `./dist/`;
    if(fs.existsSync(libPath)) {
        fs.rmSync(libPath, { recursive: true })
    }

    fs.mkdirSync(libPath, { recursive: true });
    const jsFiles = [
        `./private/${package.name}/runtime.js`,
        `./private/${package.name}/polyfills.js`,
        `./private/${package.name}/scripts.js`,
        `./private/${package.name}/main.js`
    ];

    await concat(jsFiles, `${libPath}/ca-chat-container.js`);
})();