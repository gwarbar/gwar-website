import fs from 'fs';

// Read files
const html = fs.readFileSync(new URL('./menu.html', import.meta.url), 'utf-8');
const translationsSrc = fs.readFileSync(new URL('./js/translations.js', import.meta.url), 'utf-8');

// Evaluate translations.js to get MENU_DICTIONARY
const moduleContent = translationsSrc.replace(/export /g, '');
let TRANSLATIONS_OUT, MENU_DICTIONARY_OUT;
eval(moduleContent + '\nTRANSLATIONS_OUT = TRANSLATIONS;\nMENU_DICTIONARY_OUT = MENU_DICTIONARY;');
const dict = MENU_DICTIONARY_OUT;

// Basic regex to find text inside <p class="menu-item-desc">
const regex = /<p class="menu-item-desc">([\s\S]*?)<\/p>/g;
let match;
const targets = [];
while ((match = regex.exec(html)) !== null) {
    targets.push(match[1].trim());
}

const languages = ['en', 'de', 'fr', 'es', 'ua'];
const polishStopWords = [
    ' sok ', ' syrop ', 'puree', 'kawa', 'słodki', 'kwas ',
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
                missingTranslations.add(`${word} found in: "${text.trim().replace(/\n/g, ' ')}" (original: "${originalText.trim().replace(/\n/g, ' ')}")`);
            }
        });
    });

    console.log(`\n=================== ${lang.toUpperCase()} ===================`);
    if (missingTranslations.size > 0) {
        missingTranslations.forEach(v => console.log("MISSING:", v));
    } else {
        console.log("Looks clean!");
    }
});
