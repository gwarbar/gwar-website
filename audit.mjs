import fs from 'fs';

// Read files
const html = fs.readFileSync(new URL('./menu.html', import.meta.url), 'utf-8');
const translationsSrc = fs.readFileSync(new URL('./js/translations.js', import.meta.url), 'utf-8');

// Evaluate translations.js to get MENU_DICTIONARY
const moduleContent = translationsSrc.replace(/export /g, '');
let TRANSLATIONS_OUT, MENU_DICTIONARY_OUT;
eval(moduleContent + '\nTRANSLATIONS_OUT = TRANSLATIONS;\nMENU_DICTIONARY_OUT = MENU_DICTIONARY;');
const dict = MENU_DICTIONARY_OUT;

// Find text inside targets
const targets = [];
const regexes = [
    /<h3 class="menu-category-title"[^>]*>([\s\S]*?)<\/h3>/g,
    /<h4 class="menu-sub-section">([\s\S]*?)<\/h4>/g,
    /<h4 class="menu-item-name">([\s\S]*?)<\/h4>/g,
    /<p class="menu-item-desc">([\s\S]*?)<\/p>/g
];

regexes.forEach(regex => {
    let match;
    while ((match = regex.exec(html)) !== null) {
        targets.push(match[1].trim());
    }
});

const languages = ['en', 'de', 'fr', 'es', 'ua'];

let markdown = `# Menu Translations Audit\n\n`;
markdown += `| Original (PL) | EN | DE | FR | ES | UA |\n`;
markdown += `|---|---|---|---|---|---|\n`;

targets.forEach(originalText => {
    let row = `| ${originalText.replace(/\n\s+/g, ' ')} |`;

    languages.forEach(lang => {
        let text = originalText;
        const sortedPlKeys = Object.keys(dict).sort((a, b) => b.length - a.length);

        for (const pl of sortedPlKeys) {
            const translations = dict[pl];
            if (translations[lang]) {
                let escapedPl = pl.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
                escapedPl = escapedPl.replace(/\s+/g, '\\s+');
                const transRegex = new RegExp(escapedPl, 'gi');
                text = text.replace(transRegex, translations[lang]);
            }
        }
        row += ` ${text.replace(/\n\s+/g, ' ')} |`;
    });

    markdown += row + `\n`;
});

// Write to the brain directory artifacts path 
// since my instruction says "All artifacts should be written to <appDataDir>/brain/<conversation-id>"
const outDir = '/Users/maciej/.gemini/antigravity/brain/6b8e7c78-f974-4a74-b56d-e4a072b20f29';
if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
}
fs.writeFileSync(`${outDir}/walkthrough.md`, markdown);
console.log("Audit complete. Artifact written.");
