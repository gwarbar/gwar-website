import fs from 'fs';
import { JSDOM } from 'jsdom';

// Read files
const html = fs.readFileSync('menu.html', 'utf-8');
const translationsSrc = fs.readFileSync('js/translations.js', 'utf-8');

// Evaluate translations.js to get MENU_DICTIONARY (very hacky but works for this test)
const moduleContent = translationsSrc.replace(/export /g, '');
eval(moduleContent); // Creates TRANSLATIONS and MENU_DICTIONARY in local scope

const dom = new JSDOM(html);
const document = dom.window.document;

const dict = MENU_DICTIONARY;
const targets = document.querySelectorAll('.menu-item-desc, .menu-category-title, .menu-sub-section, .menu-item-name');

const languages = ['en', 'de', 'fr', 'es', 'ua'];
const results = {};

for (const lang of languages) {
    results[lang] = [];
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
        
        // Let's filter out elements that might just be names (menu-item-name) unless we care.
        // Actually we only translate standard phrases.
        // What remains in text?
        results[lang].push(text);
    });
}

// Log a few translated verses to see what they look like, and find Polish words.
const sampleLang = 'en';
console.log("=== EN TRANSLATIONS ===");
results[sampleLang].forEach(text => {
    // Check if common polish words are still in there
    if (text.match(/\b(z|i|sok|syrop|z|do|ze|woda|wódka|puree|kawa|słodki|kwas|domowy)\b/i)) {
        console.log("POTENTIAL UNTRANSLATED:", text);
    }
});
