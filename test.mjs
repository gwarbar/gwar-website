import fs from 'fs';
import { TRANSLATIONS, MENU_DICTIONARY } from './js/translations.js';

// Read files
const html = fs.readFileSync(new URL('./menu.html', import.meta.url), 'utf-8');

const dict = MENU_DICTIONARY;

// Basic regex to find text inside <p class="menu-item-desc">
const regex = /<p class="menu-item-desc">([\s\S]*?)<\/p>/g;
let match;
const targets = [];
while ((match = regex.exec(html)) !== null) {
    targets.push(match[1].trim());
}

// Find text inside <h4 class="menu-item-name"> (sometimes it has translation parts too)
const regexH4 = /<h4 class="menu-item-name">([\s\S]*?)<\/h4>/g;
while ((match = regexH4.exec(html)) !== null) {
    targets.push(match[1].trim());
}

const languages = ['en', 'de', 'fr', 'es', 'ua'];
const polishStopWords = [
    ' sok ', ' syrop ', 'puree', 'kawa', 'słodki', 'kwas',
    'domowy', 'kordiał', 'napój', 'limonki', 'cytryny', 'pomarańczy', 'jaja', 'likiery', 'owoce',
    'gazowana', 'niegazowana', 'jabłko', 'mięta', 'imbir', 'marakuja', 'białko', 'sznaps', 'świeżo'
];

languages.forEach(lang => {
    let missingTranslations = new Set();

    targets.forEach(originalText => {
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

        // Find if Polish words are still left in the translated text
        polishStopWords.forEach(word => {
            if (text.toLowerCase().includes(word.toLowerCase())) {
                missingTranslations.add(`${word} (w: ${originalText})`);
            }
        });
    });

    console.log(`--- Language: ${lang.toUpperCase()} ---`);
    if (missingTranslations.size > 0) {
        console.log("Unmatched words that might be Polish:");
        missingTranslations.forEach(v => console.log(" -", v));
    } else {
        console.log("Looks clean!");
    }
});

console.log("--- English sample ---")
let sample = targets[0];
const sortedPlKeys = Object.keys(dict).sort((a, b) => b.length - a.length);
for (const pl of sortedPlKeys) {
    if (dict[pl]['en']) {
        let escapedPl = pl.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&').replace(/\s+/g, '\\s+');
        sample = sample.replace(new RegExp(escapedPl, 'gi'), dict[pl]['en']);
    }
}
console.log(targets[0], "-->", sample);
