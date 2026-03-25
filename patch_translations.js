import fs from 'fs';

const patch = `
    "sok świeżo wyciskany z pomarańczy": {
        "en": "freshly squeezed orange juice",
        "de": "frisch gepresster Orangensaft",
        "fr": "jus d'orange fraîchement pressé",
        "es": "zumo de naranja recién exprimido",
        "ua": "свіжовичавлений апельсиновий сік"
    },
    "z pomarańczy": {
        "en": "orange",
        "de": "Orange",
        "fr": "d'orange",
        "es": "de naranja",
        "ua": "апельсиновий"
    },
    "syrop fiołkowy": {
        "en": "violet syrup",
        "de": "Veilchensirup",
        "fr": "sirop de violette",
        "es": "sirope de violeta",
        "ua": "фіалковий сироп"
    },
    "syrop różany": {
        "en": "rose syrup",
        "de": "Rosensirup",
        "fr": "sirop de rose",
        "es": "sirope de rosa",
        "ua": "трояндовий сироп"
    },
    "syrop yuzu": {
        "en": "yuzu syrup",
        "de": "Yuzu-Sirup",
        "fr": "sirop de yuzu",
        "es": "sirope de yuzu",
        "ua": "сироп юзу"
    },
    "syrop brzoskwiniowy": {
        "en": "peach syrup",
        "de": "Pfirsichsirup",
        "fr": "sirop de pêche",
        "es": "sirope de melocotón",
        "ua": "персиковий сироп"
    },
    "syrop z werbeny": {
        "en": "verbena syrup",
        "de": "Eisenkrautsirup",
        "fr": "sirop de verveine",
        "es": "sirope de verbena",
        "ua": "сироп вербени"
    },
    "syrop bananowy": {
        "en": "banana syrup",
        "de": "Bananensirup",
        "fr": "sirop de banane",
        "es": "sirope de plátano",
        "ua": "банановий сироп"
    },
    "syrop z moreli japońskiej": {
        "en": "Japanese apricot syrup",
        "de": "japanischer Aprikosensirup",
        "fr": "sirop d'abricot japonais",
        "es": "sirope de albaricoque japonés",
        "ua": "сироп японського абрикоса"
    },
    "syrop z zielonego jabłka": {
        "en": "green apple syrup",
        "de": "grüner Apfelsirup",
        "fr": "sirop de pomme verte",
        "es": "sirope de manzana verde",
        "ua": "сироп зеленого яблука"
    },
    "syrop kokosowy": {
        "en": "coconut syrup",
        "de": "Kokossirup",
        "fr": "sirop de noix de coco",
        "es": "sirope de coco",
        "ua": "кокосовий сироп"
    },
    "syrop waniliowy": {
        "en": "vanilla syrup",
        "de": "Vanillesirup",
        "fr": "sirop de vanille",
        "es": "sirope de vainilla",
        "ua": "ванільний сироп"
    },
    "syrop liczi": {
        "en": "lychee syrup",
        "de": "Litschisirup",
        "fr": "sirop de litchi",
        "es": "sirope de lichi",
        "ua": "сироп лічі"
    },
    "sok ananasowy": {
        "en": "pineapple juice",
        "de": "Ananassaft",
        "fr": "jus d'ananas",
        "es": "zumo de piña",
        "ua": "ананасовий сік"
    },
    "sok pomarańczowy": {
        "en": "orange juice",
        "de": "Orangensaft",
        "fr": "jus d'orange",
        "es": "zumo de naranja",
        "ua": "апельсиновий сік"
    },
    "sok żurawinowy": {
        "en": "cranberry juice",
        "de": "Cranberrysaft",
        "fr": "jus de canneberge",
        "es": "zumo de arándano",
        "ua": "журавлинний сік"
    },
    "sok tłoczony jabłkowy": {
        "en": "pressed apple juice",
        "de": "gepresster Apfelsaft",
        "fr": "jus de pomme pressé",
        "es": "zumo de manzana prensado",
        "ua": "яблучний сік прямого віджиму"
    },
    "puree z marakui": {
        "en": "passion fruit puree",
        "de": "Passionsfruchtpüree",
        "fr": "purée de fruit de la passion",
        "es": "puré de maracuyá",
        "ua": "пюре з маракуї"
    },
    "purée z marakui": {
        "en": "passion fruit puree",
        "de": "Passionsfruchtpüree",
        "fr": "purée de fruit de la passion",
        "es": "puré de maracuyá",
        "ua": "пюре з маракуї"
    },
    "purée truskawkowe": {
        "en": "strawberry puree",
        "de": "Erdbeerpüree",
        "fr": "purée de fraises",
        "es": "puré de fresa",
        "ua": "полуничне пюре"
    },
    "likier bananowy": {
        "en": "banana liqueur",
        "de": "Bananenlikör",
        "fr": "liqueur de banane",
        "es": "licor de plátano",
        "ua": "банановий лікер"
    },
    "likier brzoskwiniowy": {
        "en": "peach liqueur",
        "de": "Pfirsichlikör",
        "fr": "liqueur de pêche",
        "es": "licor de melocotón",
        "ua": "персиковий лікер"
    },
    "likier kokosowy": {
        "en": "coconut liqueur",
        "de": "Kokosnusslikör",
        "fr": "liqueur de noix de coco",
        "es": "licor de coco",
        "ua": "кокосовий лікер"
    },
    "likier z kwiatu bzu": {
        "en": "elderflower liqueur",
        "de": "Holunderblütenlikör",
        "fr": "liqueur de sureau",
        "es": "licor de saúco",
        "ua": "лікер з квітів бузини"
    },
    "napar z lawendy": {
        "en": "lavender infusion",
        "de": "Lavendelaufguss",
        "fr": "infusion de lavande",
        "es": "infusión de lavanda",
        "ua": "настій лаванди"
    },
    "świeża bazylia": {
        "en": "fresh basil",
        "de": "frisches Basilikum",
        "fr": "basilic frais",
        "es": "albahaca fresca",
        "ua": "свіжий базилік"
    },
    "świeży ananas": {
        "en": "fresh pineapple",
        "de": "frische Ananas",
        "fr": "ananas frais",
        "es": "piña fresca",
        "ua": "свіжий ананас"
    },
    "jabłko": {
        "en": "apple",
        "de": "Apfel",
        "fr": "pomme",
        "es": "manzana",
        "ua": "яблуко"
    },
`;

const file = fs.readFileSync('js/translations.js', 'utf-8');
const newFile = file.replace(/};?\s*$/g, patch + "\n};\n");
fs.writeFileSync('js/translations.js', newFile);
console.log("Patched successfully");
