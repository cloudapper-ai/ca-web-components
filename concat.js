const concat = require('concat');
const fs = require('fs');
const package = require('./package.json');

(async ()=> { 
    const libPath = `./lib/${package.version}`;
    if(fs.existsSync(libPath)) {
        throw new Error('This version of library bundle is already available in the repository. Please upgrade your version number and re-publish the bundle.');
        return;
    }

    fs.mkdirSync(libPath, { recursive: true });
    const jsFiles = [
        `./dist/${package.name}/runtime.js`,
        `./dist/${package.name}/polyfills.js`,
        `./dist/${package.name}/scripts.js`,
        `./dist/${package.name}/main.js`
    ];

    const cssFiles = [ 
        `./dist/${package.name}/styles.css`
    ];

    await concat(jsFiles, `${libPath}/ca-chat-container.js`);
    await concat(cssFiles, `${libPath}/ca-chat-container.css`);
})();