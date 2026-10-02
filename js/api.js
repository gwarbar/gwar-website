/* INSTAGRAM API */
import { INSTAGRAM_DATA } from './instagram_data.js?v=2';

// Live Behold feed - Behold refreshes it automatically, no manual updates needed.
// INSTAGRAM_DATA is only a fallback if the live feed is unreachable.
const BEHOLD_FEED_URL = 'https://feeds.behold.so/oQn5QE77nlwKbBhGPy83';

export async function loadInstagramFeed() {
    const container = document.querySelector('#gallery .carousel-container');
    if (!container) return;

    let data = INSTAGRAM_DATA;
    try {
        const response = await fetch(BEHOLD_FEED_URL);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const live = await response.json();
        if (live && live.posts && live.posts.length > 0) data = live;
    } catch (error) {
        console.warn('[GWAR-API] Live Behold feed failed, using static fallback:', error);
    }

    if (data && data.posts) {
        container.innerHTML = ''; // Clear placeholders
        data.posts.forEach(post => {
            // Determine Media URL
            let imgUrl = null;
            let width = null;
            let height = null;

            if (post.sizes && post.sizes.medium) {
                width = post.sizes.medium.width;
                height = post.sizes.medium.height;
            } else if (post.sizes && post.sizes.large) {
                width = post.sizes.large.width;
                height = post.sizes.large.height;
            }

            // Prefer Behold-hosted sizes (permanent) over raw Instagram CDN URLs (expire after a few weeks)
            const beholdUrl = (post.sizes && post.sizes.medium && post.sizes.medium.mediaUrl) ||
                (post.sizes && post.sizes.large && post.sizes.large.mediaUrl);
            if (post.mediaType === 'VIDEO') {
                imgUrl = beholdUrl || post.thumbnailUrl || post.mediaUrl;
            } else {
                imgUrl = beholdUrl || post.mediaUrl;
            }

            // Calculate Aspect Ratio or default to 1/1 square format (or 9/16 for video)
            let aspectRatio = post.mediaType === 'VIDEO' ? '9/16' : '1/1';
            if (width && height) {
                aspectRatio = `${width}/${height}`;
            }

            createInstaItem(container, imgUrl, post.permalink, post.mediaType === 'VIDEO', aspectRatio);
        });
    }
}

function createInstaItem(container, imgUrl, link, isVideo, aspectRatio) {
    const item = document.createElement('div');
    item.className = 'carousel-item insta-post';
    item.style.backgroundImage = `url('${imgUrl}')`;
    item.style.cursor = 'pointer';

    // DYNAMIC SIZING: Fixed Height, Variable Width based on Aspect Ratio
    item.style.flex = '0 0 auto';
    item.style.height = '500px';
    item.style.width = 'auto';
    item.style.aspectRatio = aspectRatio;

    // Icon Logic
    let icon = '';
    let label = 'Zobacz post';

    if (isVideo) {
        icon = '<svg viewBox="0 0 24 24" width="24" height="24" fill="white"><path d="M8 5v14l11-7z"/></svg>'; // Play
        label = 'Odtwórz';
    } else {
        icon = '<svg viewBox="0 0 24 24" width="24" height="24" fill="white"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>'; // Image
    }

    item.innerHTML = `
        <div class="insta-overlay">
            <div class="insta-icon-main">${icon}</div>
            <span class="insta-label">${label}</span>
        </div>
    `;

    // Click behavior: Open Instagram link
    item.onclick = () => window.open(link, '_blank');

    container.appendChild(item);
}

/* GOOGLE REVIEWS */
// Reviews are fetched once a day by .github/workflows/update-reviews.yml
// (scripts/fetch-reviews.mjs) and saved to data/reviews.json - no API key in the browser.
const REVIEWS_LINK = 'https://www.google.com/maps/place/Bar+Gwar/@50.048033,19.946036,15z/data=!4m8!3m7!1s0x47165bdfaaf2021b:0x960543b90ef2cad3!8m2!3d50.0480326!4d19.9460358!9m1!1b1!16s%2Fg%2F11kq00tlpl?hl=pl&entry=ttu&g_ep=EgoyMDI2MDYwMy4xIKXMDSoASAFQAw%3D%3D';
const GOOGLE_LOGO = 'https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg';

function escapeHtml(str) {
    return String(str ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export async function loadGoogleReviews() {
    const container = document.querySelector('#reviews .carousel-container');
    if (!container) return;

    try {
        const response = await fetch(`data/reviews.json?d=${new Date().toISOString().slice(0, 10)}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        const reviews = (data.reviews || []).filter(r => r.rating === 5 && r.text);
        if (reviews.length === 0) return;

        container.innerHTML = '';
        reviews.forEach(review => {
            const card = document.createElement('a');
            card.className = 'carousel-item review-card';
            card.href = REVIEWS_LINK;
            card.target = '_blank';
            card.style.textDecoration = 'none';
            card.style.color = 'inherit';

            const stars = '★'.repeat(Math.round(review.rating || 5));
            const authorName = escapeHtml(review.author || 'Gość');
            const photoUrl = escapeHtml(review.photo || GOOGLE_LOGO);
            const text = review.text.length > 150 ? review.text.substring(0, 150) + '...' : review.text;

            card.innerHTML = `
                <div class="review-header" style="display:flex; align-items:center; gap:10px; margin-bottom:10px;">
                    <img src="${photoUrl}" alt="${authorName}" referrerpolicy="no-referrer" style="width:40px; height:40px; border-radius:50%; object-fit:cover;" onerror="this.src='${GOOGLE_LOGO}'">
                    <div>
                        <div class="review-author" style="font-weight:bold;">${authorName}</div>
                        <div class="stars" style="color:gold; font-size:0.9em;">${stars}</div>
                    </div>
                </div>
                <div class="review-text" style="font-size:0.9em; line-height:1.4;">"${escapeHtml(text)}"</div>
                <div class="google-badge" style="position:absolute; bottom:15px; right:15px; width:18px; height:18px; opacity:0.6;">
                    <img src="${GOOGLE_LOGO}" alt="Google" style="width:100%; height:100%;">
                </div>
            `;
            container.appendChild(card);
        });
    } catch (error) {
        console.error('[GWAR-API] Reviews load error:', error);
    }
}

/**
 * TRAVEL TIME API
 * Uses Distance Matrix Service to calculate time from user to Bar Gwar
 */
/**
 * TRAVEL TIME API
 * Simplified: No geolocation, just static link to Google Maps
 */
export async function loadTravelTime() {
    console.log('[GWAR-API] loadTravelTime starting (Simplified mode)');
    const section = document.getElementById('travel-time-section');
    const travelLink = document.getElementById('travel-link');

    if (!section || !travelLink) return;

    // Set static link to the specific Google Maps place
    travelLink.href = 'https://www.google.com/maps/place/Bar+Gwar/@50.0480326,19.9445998,18z/data=!4m17!1m10!4m9!1m4!2m2!1d19.9639321!2d50.0541475!4e1!1m3!2m2!1d19.9455!2d50.0483!3m5!1s0x47165bdfaaf2021b:0x960543b90ef2cad3!8m2!3d50.0480326!4d19.9460358!16s%2Fg%2F11kq00tlpl?entry=ttu&g_ep=EgoyMDI2MDIwNC4wIKXMDSoASAFQAw%3D%3D';

    // Show button immediately
    section.style.display = 'block';
}

/**
 * WEATHER API
 * Fetches current weather for Krakow using wttr.in
 */
export async function loadWeather() {
    const widget = document.getElementById('weather-widget');
    const iconEl = widget?.querySelector('.weather-icon');
    const tempEl = widget?.querySelector('.weather-temp');

    if (!widget || !iconEl || !tempEl) return;

    try {
        // Krakow weather in JSON format
        const response = await fetch('https://wttr.in/Krakow?format=j1');
        const data = await response.json();

        if (data && data.current_condition && data.current_condition[0]) {
            const condition = data.current_condition[0];
            const temp = condition.temp_C;
            const code = condition.weatherCode;

            // Simple mapping of wttr.in weather codes to emojis
            const weatherEmojis = {
                "113": "☀️", // Clear/Sunny
                "116": "⛅", // Partly Cloudy
                "119": "☁️", // Cloudy
                "122": "☁️", // Overcast
                "143": "🌫️", // Mist
                "176": "🌦️", // Patchy rain nearby
                "200": "⛈️", // Thundery outbreaks nearby
                "248": "🌫️", // Fog
                "263": "🌦️", // Patchy light drizzle
                "266": "🌦️", // Light drizzle
                "293": "🌧️", // Patchy light rain
                "296": "🌧️", // Light rain
                "302": "🌧️", // Moderate rain
                "308": "🌧️", // Heavy rain
                "353": "🌦️", // Light rain shower
                "356": "🌧️", // Moderate or heavy rain shower
            };

            const emoji = weatherEmojis[code] || "🌡️";

            iconEl.textContent = emoji;
            tempEl.textContent = `${temp}°C`;
            widget.style.display = 'flex';

            console.log(`[GWAR-API] Weather loaded: ${temp}°C, Code: ${code}`);
        }
    } catch (error) {
        console.error('[GWAR-API] Weather Fetch Error:', error);
    }
}


