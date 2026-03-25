import fs from 'fs';

const html = fs.readFileSync('menu.html', 'utf-8');

// Function to extract a chunk based on start comment and next comment (or end of container)
function extractChunk(startComment, endComment) {
    const startIdx = html.indexOf(startComment);
    if (startIdx === -1) throw new Error(`Start not found: ${startComment}`);
    const endIdx = html.indexOf(endComment, startIdx + startComment.length);
    if (endIdx === -1) throw new Error(`End not found: ${endComment}`);

    return html.slice(startIdx, endIdx);
}

// Extract all chunks
const gwarna = extractChunk('<!-- GWARNA WIOSNA -->', '<!-- SPRITZ MENU -->');
const spritz = extractChunk('<!-- SPRITZ MENU -->', '<!-- KAWA I HERBATA -->');
const kawa = extractChunk('<!-- KAWA I HERBATA -->', '<!-- NAPOJE BEZALKOHOLOWE -->');
const napoje = extractChunk('<!-- NAPOJE BEZALKOHOLOWE -->', '<!-- PIWA -->');
const piwa = extractChunk('<!-- PIWA -->', '<!-- ALKOHOLE MOCNE -->');
const mocne = extractChunk('<!-- ALKOHOLE MOCNE -->', '<!-- KOKTAJLE BEZALKOHOLOWE -->');
const bezalko = extractChunk('<!-- KOKTAJLE BEZALKOHOLOWE -->', '<!-- GWAR KOKTAJLE -->');
const koktajle = extractChunk('<!-- GWAR KOKTAJLE -->', '<!-- SHOTY I GWARÓWKA -->');
const shoty = extractChunk('<!-- SHOTY I GWARÓWKA -->', '<!-- WINA -->');
const wina = extractChunk('<!-- WINA -->', '<!-- SNACKI -->');
const snacki = extractChunk('<!-- SNACKI -->', '</div> <!-- htmlMenuContainer -->');

// Construct new htmlMenuContainer content
const newContent =
    gwarna +
    spritz +
    koktajle +
    bezalko +
    piwa +
    wina +
    shoty +
    mocne +
    kawa +
    napoje +
    snacki;

// Replace old content with new content
const beforeStart = html.slice(0, html.indexOf('<!-- GWARNA WIOSNA -->'));
const afterEnd = html.slice(html.indexOf('</div> <!-- htmlMenuContainer -->'));

const finalHtml = beforeStart + newContent + afterEnd;
fs.writeFileSync('menu.html', finalHtml);
console.log('Reordered successfully!');
