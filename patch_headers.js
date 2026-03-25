const fs = require('fs');

const patch = `
    "GWARNA WIOSNA (Koktajle Autorskie)": {
        "en": "GWAR SPRING (Signature Cocktails)",
        "de": "GWAR FRÜHLING (Signatur-Cocktails)",
        "fr": "GWAR PRINTEMPS (Cocktails Signature)",
        "es": "GWAR PRIMAVERA (Cócteles de la casa)",
        "ua": "ГВАР ВЕСНА (Авторські коктейлі)"
    },
    "SPRITZ MENU": {
        "en": "SPRITZ MENU",
        "de": "SPRITZ MENÜ",
        "fr": "CARTE DES SPRITZ",
        "es": "MENÚ DE SPRITZ",
        "ua": "СПРИТЦ МЕНЮ"
    },
    "GWAR KOKTAJLE": {
        "en": "GWAR COCKTAILS",
        "de": "GWAR COCKTAILS",
        "fr": "GWAR COCKTAILS",
        "es": "GWAR CÓCTELES",
        "ua": "ГВАР КОКТЕЙЛІ"
    },
    "SHOTY (Cena za 1 szt. / Cena za tacę (6 szt.))": {
        "en": "SHOTS (Price per 1 pc / Price per tray (6 pcs))",
        "de": "SHOTS (Preis pro Stk / Preis pro Tablett (6 Stk))",
        "fr": "SHOTS (Prix par pc / Prix par plateau (6 pc))",
        "es": "CHUPITOS (Precio por ud / Precio por bandeja (6 ud))",
        "ua": "ШОТИ (Ціна за 1 шт / Ціна за тацю (6 шт))"
    },
    "WINA (125ml / 250ml / 750ml)": {
        "en": "WINES (125ml / 250ml / 750ml)",
        "de": "WEINE (125ml / 250ml / 750ml)",
        "fr": "VINS (125ml / 250ml / 750ml)",
        "es": "VINOS (125ml / 250ml / 750ml)",
        "ua": "ВИНА (125ml / 250ml / 750ml)"
    },
    "ALKOHOLE MOCNE (40ml)": {
        "en": "SPIRITS",
        "de": "SPIRITUOSEN",
        "fr": "ALCOOLS FORTS",
        "es": "DESTILADOS",
        "ua": "МІЦНИЙ АЛКОГОЛЬ"
    },
    "PIWA": {
        "en": "BEERS",
        "de": "BIERE",
        "fr": "BIÈRES",
        "es": "CERVEZAS",
        "ua": "ПИВО"
    },
    "BEZALKOHOLOWE": {
        "en": "NON-ALCOHOLIC",
        "de": "ALKOHOLFREI",
        "fr": "SANS ALCOOL",
        "es": "SIN ALCOHOL",
        "ua": "БЕЗАЛКОГОЛЬНІ"
    },
    "KAWA / HERBATA": {
        "en": "COFFEE / TEA",
        "de": "KAFFEE / TEE",
        "fr": "CAFÉ / THÉ",
        "es": "CAFÉ / ТÉ",
        "ua": "KAВА / ЧАЙ"
    },
    "SNACKI": {
        "en": "SNACKS",
        "de": "SNACKS",
        "fr": "SNACKS",
        "es": "SNACKS",
        "ua": "СНЕКИ"
    },
    "KOKTAJLE BEZALKOHOLOWE": {
        "en": "NON-ALCOHOLIC COCKTAILS",
        "de": "ALKOHOLFREIE COCKTAILS",
        "fr": "COCKTAILS SANS ALCOOL",
        "es": "CÓCTELES SIN ALCOHOL",
        "ua": "БЕЗАЛКОГОЛЬНІ КОКТЕЙЛІ"
    }
`;

const file = fs.readFileSync('js/translations.js', 'utf-8');
const newFile = file.replace(/};?\s*$/g, patch + "\n};\n");
fs.writeFileSync('js/translations.js', newFile);
console.log("Patched successfully");
