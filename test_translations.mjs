import fs from 'fs';
import { JSDOM } from 'jsdom';

// Read files
const html = fs.readFileSync(new URL('./menu.html', import.meta.url), 'utf-8');
const translationsSrc = fs.readFileSync(new URL('./js/translations.js', import.meta.url), 'utf-8');

// Evaluate translations.js to get MENU_DICTIONARY
const moduleContent = translationsSrc.replace(/export /g, '');

const mockConsole = { log: () => { } };
const context = {
    console: mockConsole,
    TRANSLATIONS: {},
    MENU_DICTIONARY: {}
};

const scriptCode = `
${moduleContent}
module.exports = { TRANSLATIONS, MENU_DICTIONARY };
`;

fs.writeFileSync('temp_eval.cjs', scriptCode);
const { MENU_DICTIONARY } = await import('./temp_eval.cjs');

const dom = new JSDOM(html);
const document = dom.window.document;

const dict = MENU_DICTIONARY;
const targets = Array.from(document.querySelectorAll('.menu-item-desc'));
// We mainly care about descriptions, sub-sections, and titles. But descriptions is where the un-translated ingredients live.

const languages = ['en', 'de', 'fr', 'es', 'ua'];

// A list of common Polish words that should not be in the output of foreign languages
// if they are properly translated
const polishStopWords = [
    'z', 'sok', 'syrop', 'do', 'ze', 'woda', 'wódka', 'puree', 'kawa', 'słodki', 'kwas',
    'domowy', 'kordiał', 'napój', 'limonki', 'cytryny', 'pomarańczy', 'jaja', 'likiery', 'owoce',
    'gazowana', 'niegazowana', 'jabłko', 'mięta', 'imbir', 'marakuja', 'białko'
];

const stopWordRegex = new RegExp(`\\b(${polishStopWords.join('|')})\\b`, 'i');

languages.forEach(lang => {
    let missingTranslations = new Set();

    targets.forEach(el => {
        let text = el.textContent.trim();
        const sortedPlKeys = Object.keys(dict).sort((a, b) => b.length - a.length);

        for (const pl of sortedPlKeys) {
            const translations = dict[pl];
            if (translations[lang]) {
                let escapedPl = pl.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
                escapedPl = escapedPl.replace(/\s+/g, '\\s+');
                const regex = new RegExp(escapedPl, 'gi');
                text = text.replace(regex, translations[lang]);
            }
        }

        // Find if Polish words are still left in the translated text
        const words = text.split(/[\s/]+/); // Splitting by space and slash
        for (const word of words) {
            if (stopWordRegex.test(word)) {
                missingTranslations.add(word.toLowerCase());
            }
        }
    });

    console.log(`--- Language: ${lang.toUpperCase()} ---`);
    if (missingTranslations.size > 0) {
        console.log("Unmatched words that might be Polish:", Array.from(missingTranslations));
    } else {
        console.log("Looks clean!");
    }
});

// Also print the translated text for UA just to manually verify if it translates.
console.log("--- UA Sample ---");
for (let i = 0; i < 3; i++) {
    let text = targets[i].textContent.trim();
    const sortedPlKeys = Object.keys(dict).sort((a, b) => b.length - a.length);
    for (const pl of sortedPlKeys) {
        if (dict[pl]['ua']) {
            let escapedPl = pl.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&').replace(/\s+/g, '\\s+');
            text = text.replace(new RegExp(escapedPl, 'gi'), dict[pl]['ua']);
        }
    }
    console.log(text);
}
