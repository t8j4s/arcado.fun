const fs = require('fs');
const path = require('path');

const ROOT = 'c:\\Users\\HP\\Downloads\\deploy-69b81fa4ea59bc1a09c375ea';
const favIconTag = '  <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🕹️</text></svg>">\n';

function updateFiles(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            updateFiles(filePath);
        } else if (file.endsWith('.html')) {
            let content = fs.readFileSync(filePath, 'utf-8');
            if (!content.includes('rel="icon"')) {
                content = content.replace('</head>', favIconTag + '</head>');
                fs.writeFileSync(filePath, content);
                console.log(`Updated: ${filePath}`);
            }
        }
    });
}

const targetDirs = [
    path.join(ROOT, 'pages'),
    path.join(ROOT, 'game')
];

targetDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
        updateFiles(dir);
    }
});
