// Copies the Behold Instagram feed into the repo: data/instagram.json + images/instagram/*.jpg.
// Run daily by .github/workflows/update-instagram.yml, so the site never shows expired images,
// even if the Behold feed stops refreshing (free plan needs a login once a month).
//
// Behold gives no "last refreshed" date, so we track when likes/followers last changed.
// If nothing changed for STALE_DAYS, the feed is most likely paused -> exit code 2.
import { readFile, writeFile, readdir, unlink, access } from 'node:fs/promises';

const FEED_URL = 'https://feeds.behold.so/oQn5QE77nlwKbBhGPy83';
const DATA_FILE = new URL('../data/instagram.json', import.meta.url);
const IMAGE_DIR = new URL('../images/instagram/', import.meta.url);
const STALE_DAYS = 7;

const response = await fetch(FEED_URL);
if (!response.ok) throw new Error(`Behold feed ${response.status}`);
const feed = await response.json();
if (!feed.posts || feed.posts.length === 0) throw new Error('Behold feed has no posts');

let saved = {};
try { saved = JSON.parse(await readFile(DATA_FILE, 'utf8')); } catch { /* first run */ }

const posts = [];
for (const post of feed.posts) {
    const size = post.sizes?.medium || post.sizes?.large;
    if (!size?.mediaUrl) continue;
    const file = `${post.id}.jpg`;
    const target = new URL(file, IMAGE_DIR);
    try {
        await access(target);
    } catch {
        const img = await fetch(size.mediaUrl);
        if (!img.ok) throw new Error(`Image ${post.id}: ${img.status}`);
        await writeFile(target, Buffer.from(await img.arrayBuffer()));
    }
    posts.push({
        id: post.id,
        permalink: post.permalink,
        mediaType: post.mediaType,
        timestamp: post.timestamp,
        image: `images/instagram/${file}`,
        width: size.width,
        height: size.height
    });
}

// Remove images of posts that are no longer in the feed
const keep = new Set(posts.map(p => `${p.id}.jpg`));
for (const name of await readdir(IMAGE_DIR)) {
    if (name.endsWith('.jpg') && !keep.has(name)) await unlink(new URL(name, IMAGE_DIR));
}

const fingerprint = JSON.stringify([feed.followersCount, feed.posts.map(p => [p.id, p.likeCount, p.commentsCount])]);
const now = new Date().toISOString();
const lastChangedAt = fingerprint === saved.fingerprint && saved.lastChangedAt ? saved.lastChangedAt : now;

await writeFile(DATA_FILE, JSON.stringify({ lastChangedAt, fingerprint, posts }, null, 2) + '\n');

const staleDays = (Date.now() - new Date(lastChangedAt)) / 86400000;
console.log(`Saved ${posts.length} posts. Feed last changed ${staleDays.toFixed(1)} days ago.`);
if (staleDays >= STALE_DAYS) {
    console.log('STALE');
    process.exitCode = 2;
}
