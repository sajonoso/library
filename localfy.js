/*
This script helps convert remote css font and icon resources into local
and generates a script to download the resources locally.

Disabling HTTP requests with the following code:
    XMLHttpRequest = function(){}
    XMLHttpRequest.prototype = {
        open: function(){},
        send: function(){},
    };
may also help remove network requests
*/

const fs = require('fs');

const print = console.log;

const readCSSFile = (cssPath) => {
    return fs.readFileSync(cssPath, 'utf8')
}

const getScriptExtension = () => {
    if (process.platform.indexOf("win") === 0) {
        return 'cmd';
    } else {
        return 'sh';
    }
}

const excludeExtension = (cssPath) => {
    return cssPath.slice(0, cssPath.lastIndexOf('.'));
}

const generateNewCSS = (oldFile, cssPath) => {
    const lines = oldFile.split('\n');
    var newFile = '';
    var externalCurl = '';
    lines.forEach(line => {
        if (line.indexOf('src: url(https://') >= 0) {
            const urlParts = line.match(/http(.*)\)\s/);
            const formatParts = line.match(/format\('(.*)'\);/);
            var fileFormat = '';

            if (formatParts) fileFormat = formatParts[1];

            if (urlParts) {
                // get url from line
                const url = urlParts[0].replace(') ', '');
                externalCurl += `curl -O ${url}\n`;

                // get filename
                filename = url.slice(url.lastIndexOf('/') + 1);

                newFile += `  src: url(${filename}) format('${fileFormat}');\n`;
            }

            // add commented out old line for reference
            newFile += `  /*${line} */\n`;
        } else {
            newFile += `${line}\n`;
        }
    });

    fs.writeFileSync(`${excludeExtension(cssPath)}.${getScriptExtension()}`, externalCurl);

    return newFile;
}


if (process.argv.length === 3) {
    const cssPath = process.argv[2];
    const content = readCSSFile(cssPath);
    const newContent = generateNewCSS(content, cssPath);
    fs.writeFileSync(`${excludeExtension(cssPath)}_local.css`, newContent);
} else {
    print('Need a filename as input');
}
