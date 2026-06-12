const fs = require('fs');
const pdf = require('pdf-parse');

async function extractText(filePath) {
    let dataBuffer = fs.readFileSync(filePath);
    try {
        const data = await pdf(dataBuffer);
        console.log(`--- START OF ${filePath} ---`);
        console.log(data.text);
        console.log(`--- END OF ${filePath} ---`);
    } catch (error) {
        console.error(`Error processing ${filePath}:`, error);
    }
}

const files = [
    '/Users/maciej/Documents/STRONA/bar-gwar-site/pdfy/Gwar_Menu 11:06:2026  .pdf',
    '/Users/maciej/Documents/STRONA/bar-gwar-site/pdfy/Gwar WKŁADKA Lato 2026.pdf'
];

async function run() {
    for (const file of files) {
        await extractText(file);
    }
}

run();
