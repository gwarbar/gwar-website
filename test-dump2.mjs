import fs from 'fs';

const html = fs.readFileSync(new URL('./menu.html', import.meta.url), 'utf-8');
const translationsSrc = fs.readFileSync(new URL('./js/translations.js', import.meta.url), 'utf-8');
const moduleContent = translationsSrc.replace(/export /g, '');
let TRANSLATIONS_OUT, MENU_DICTIONARY_OUT;
eval(moduleContent + "\nTRANSLATIONS_OUT = TRANSLATIONS; MENU_DICTIONARY_OUT = MENU_DICTIONARY;");
const dict = MENU_DICTIONARY_OUT;

const regex = /<h4 class="menu-item-name">([\s\S]*?)<\/h4>/g;
let match;
while ((match = regex.exec(html)) !== null) {
    let originalText = match[1].trim();
    let textEN = originalText;
    const sortedPlKeys = Object.keys(dict).sort((a, b) => b.length - a.length);
    for (const pl of sortedPlKeys) {
        if (dict[pl]['en']) {
            let escape = pl.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&').replace(/\s+/g, '\\s+');
            textEN = textEN.replace(new RegExp(escape, 'gi'), dict[pl]['en']);
        }
    }
    // Print lines not containing their translation to see what remains
    console.log(textEN.replace(/\n\s+/g, ' '));
}
