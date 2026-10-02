// Fetches Google reviews for Bar Gwar and saves 5-star ones to data/reviews.json.
// Run by .github/workflows/update-reviews.yml once a day (GOOGLE_API_KEY from repo secrets).
// Google returns max 5 reviews per call, so new ones are merged with the saved ones.
import { readFile, writeFile } from 'node:fs/promises';

const PLACE_ID = 'ChIJGwLyqt9bFkcR08ryDrlDBZY';
const OUTPUT = new URL('../data/reviews.json', import.meta.url);
const MAX_REVIEWS = 12;

const key = process.env.GOOGLE_API_KEY;
if (!key) throw new Error('GOOGLE_API_KEY is not set');

const response = await fetch(`https://places.googleapis.com/v1/places/${PLACE_ID}`, {
    headers: {
        'X-Goog-Api-Key': key,
        'X-Goog-FieldMask': 'rating,userRatingCount,reviews'
    }
});
if (!response.ok) throw new Error(`Places API ${response.status}: ${await response.text()}`);
const place = await response.json();

const fresh = (place.reviews || [])
    .filter(r => r.rating === 5)
    .map(r => ({
        id: r.name,
        rating: r.rating,
        text: (r.originalText || r.text || {}).text || '',
        author: r.authorAttribution?.displayName || '',
        photo: r.authorAttribution?.photoUri || '',
        url: r.googleMapsUri || '',
        publishTime: r.publishTime
    }))
    .filter(r => r.text);

let saved = [];
try {
    saved = JSON.parse(await readFile(OUTPUT, 'utf8')).reviews || [];
} catch { /* first run */ }

const byId = new Map(saved.map(r => [r.id, r]));
fresh.forEach(r => byId.set(r.id, r));
const reviews = [...byId.values()]
    .filter(r => r.rating === 5)
    .sort((a, b) => (b.publishTime || '').localeCompare(a.publishTime || ''))
    .slice(0, MAX_REVIEWS);

await writeFile(OUTPUT, JSON.stringify({
    rating: place.rating,
    userRatingCount: place.userRatingCount,
    reviews
}, null, 2) + '\n');
console.log(`Saved ${reviews.length} reviews (${fresh.length} fresh 5-star).`);
