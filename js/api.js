import { CONFIG } from './configuration.js?v=5';

/* INSTAGRAM API */
import { INSTAGRAM_DATA } from './instagram_data.js';

/* INSTAGRAM API */
export async function loadInstagramFeed() {
    const container = document.querySelector('#gallery .carousel-container');
    if (!container) return;

    // Use local data instead of API
    const data = INSTAGRAM_DATA;

    if (data && data.posts) {
        container.innerHTML = ''; // Clear placeholders
        data.posts.forEach(post => {
            // Determine Media URL (prefer medium size for performance, fall back to mediaUrl)
            let imgUrl = post.mediaUrl;
            let width = null;
            let height = null;

            if (post.sizes && post.sizes.medium) {
                imgUrl = post.sizes.medium.mediaUrl;
                width = post.sizes.medium.width;
                height = post.sizes.medium.height;
            } else if (post.sizes && post.sizes.large) {
                // Fallback if medium missing
                width = post.sizes.large.width;
                height = post.sizes.large.height;
            }

            // Handle Video Thumbnails
            if (post.mediaType === 'VIDEO' && post.thumbnailUrl) {
                imgUrl = post.thumbnailUrl;
            }

            // Calculate Aspect Ratio or default to 9/16 video format
            let aspectRatio = '9/16';
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

/* GOOGLE REVIEWS API */
export async function loadGoogleReviews() {
    console.log('[GWAR-API] loadGoogleReviews starting...');
    const container = document.querySelector('#reviews .carousel-container');

    if (!container) {
        console.error('[GWAR-API] No #reviews .carousel-container found in DOM');
        return;
    }

    try {
        console.log('[GWAR-API] Attempting to import places library...');
        if (!window.google || !window.google.maps) {
            console.error('[GWAR-API] google.maps not available yet');
            return;
        }

        const { Place } = await google.maps.importLibrary("places");
        console.log('[GWAR-API] Places library imported successfully');

        const place = new Place({
            id: CONFIG.GOOGLE_PLACE_ID
        });

        console.log('[GWAR-API] Fetching fields for Place ID:', CONFIG.GOOGLE_PLACE_ID);
        await place.fetchFields({
            fields: ['reviews', 'rating', 'displayName']
        });

        console.log('[GWAR-API] Place data received:', place);

        if (place.reviews && place.reviews.length > 0) {
            console.log(`[GWAR-API] Found ${place.reviews.length} reviews. Filtering for 5 stars...`);
            container.innerHTML = '';

            // Filter: Only 5-star reviews
            const reviews = place.reviews
                .filter(review => Math.round(review.rating || 0) === 5)
                .sort((a, b) => (b.rating || 0) - (a.rating || 0));

            if (reviews.length === 0) {
                console.warn('[GWAR-API] No 5-star reviews found in the latest sample.');
                return;
            }

            reviews.forEach((review, index) => {
                const author = review.authorAttribution;
                console.log(`[GWAR-API] Review ${index + 1} author:`, author);

                const card = document.createElement('a');
                card.className = 'carousel-item review-card';
                card.href = author?.uri || '#';
                card.target = '_blank';
                card.style.textDecoration = 'none';
                card.style.color = 'inherit';

                const stars = '★'.repeat(5);
                const authorName = author?.displayName || 'Gość';

                // Fix: Google New API uses photoURI (uppercase URI)
                const photoUrl = author?.photoURI || author?.photoUri || 'https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg';
                const text = review.text || '';

                card.innerHTML = `
                    <div class="review-header" style="display:flex; align-items:center; gap:10px; margin-bottom:10px;">
                        <img src="${photoUrl}" alt="${authorName}" style="width:40px; height:40px; border-radius:50%; object-fit:cover;" onerror="this.src='https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg'">
                        <div>
                            <div class="review-author" style="font-weight:bold;">${authorName}</div>
                            <div class="stars" style="color:gold; font-size:0.9em;">${stars}</div>
                        </div>
                    </div>
                    <div class="review-text" style="font-size:0.9em; line-height:1.4;">"${text.length > 150 ? text.substring(0, 150) + '...' : text}"</div>
                    <div class="google-badge" style="position:absolute; bottom:15px; right:15px; width:18px; height:18px; opacity:0.6;">
                        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335"/></svg>
                    </div>
                `;

                container.appendChild(card);
            });
            console.log('[GWAR-API] All 5-star reviews rendered successfully');
        } else {
            console.warn('[GWAR-API] No reviews returned from Google for this Place ID');
        }
    } catch (error) {
        console.error('[GWAR-API] Modern Google Reviews Error:', error);
        console.log('[GWAR-API] Falling back to Legacy Places Service...');
        loadGoogleReviewsLegacy(container);
    }
}

/**
 * Fallback to Legacy Places Service
 */
function loadGoogleReviewsLegacy(container) {
    if (!window.google || !window.google.maps || !window.google.maps.places) {
        console.error('[GWAR-API] Legacy Places Library not available');
        return;
    }

    const service = new google.maps.places.PlacesService(document.createElement('div'));
    const request = {
        placeId: CONFIG.GOOGLE_PLACE_ID,
        fields: ['reviews', 'rating']
    };

    console.log('[GWAR-API] Calling Legacy getDetails (Fallback)...');
    service.getDetails(request, (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place && place.reviews) {
            container.innerHTML = '';

            // Filter: Only 5-star reviews
            const reviews = place.reviews
                .filter(review => Math.round(review.rating) === 5)
                .slice(0, 5);

            reviews.forEach(review => {
                const card = document.createElement('a');
                card.className = 'carousel-item review-card';
                card.href = review.author_url || '#';
                card.target = '_blank';
                card.style.textDecoration = 'none';
                card.style.color = 'inherit';

                const stars = '★'.repeat(5);
                const photoUrl = review.profile_photo_url || 'https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg';

                card.innerHTML = `
                    <div class="review-header" style="display:flex; align-items:center; gap:10px; margin-bottom:10px;">
                        <img src="${photoUrl}" alt="${review.author_name}" style="width:40px; height:40px; border-radius:50%; object-fit:cover;" onerror="this.src='https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg'">
                        <div>
                            <div class="review-author" style="font-weight:bold;">${review.author_name}</div>
                            <div class="stars" style="color:gold; font-size:0.9em;">${stars}</div>
                        </div>
                    </div>
                    <div class="review-text" style="font-size:0.9em; line-height:1.4;">"${review.text.length > 150 ? review.text.substring(0, 150) + '...' : review.text}"</div>
                    <div class="google-badge" style="position:absolute; bottom:15px; right:15px; width:18px; height:18px; opacity:0.6;">
                        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335"/></svg>
                    </div>
                `;
                container.appendChild(card);
            });
            console.log('[GWAR-API] Legacy 5-star reviews rendered successfully');
        } else {
            console.error('[GWAR-API] Legacy fallback failed. Status:', status);
        }
    });
}

/**
 * TRAVEL TIME API
 * Uses Distance Matrix Service to calculate time from user to Bar Gwar
 */
export async function loadTravelTime() {
    console.log('[GWAR-API] loadTravelTime starting...');
    const section = document.getElementById('travel-time-section');
    const timeBadge = document.getElementById('time-estimate');
    const travelLink = document.getElementById('travel-link');

    if (!section || !timeBadge || !travelLink) return;

    // Default link to Gmaps in case geolocation fails
    const destCoords = "50.0483,19.9455";
    travelLink.href = `https://www.google.com/maps/dir/?api=1&destination=${destCoords}`;

    if (!navigator.geolocation) {
        console.warn('[GWAR-API] Geolocation not supported by browser');
        section.style.display = 'block';
        return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;

        console.log(`[GWAR-API] User coordinates: ${userLat}, ${userLng}`);

        // Finalize travel link with origin for better Gmaps behavior
        travelLink.href = `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${destCoords}`;

        try {
            if (!window.google || !window.google.maps) return;

            const service = new google.maps.DistanceMatrixService();

            service.getDistanceMatrix({
                origins: [{ lat: userLat, lng: userLng }],
                destinations: [{ lat: 50.0483, lng: 19.9455 }],
                travelMode: google.maps.TravelMode.DRIVING, // Default to driving
                unitSystem: google.maps.UnitSystem.METRIC,
            }, (response, status) => {
                if (status === 'OK' && response.rows[0].elements[0].status === 'OK') {
                    const duration = response.rows[0].elements[0].duration.text;
                    console.log(`[GWAR-API] Travel time found: ${duration}`);
                    timeBadge.textContent = duration;
                    section.style.display = 'block';
                } else {
                    console.warn('[GWAR-API] Distance Matrix failed:', status);
                    section.style.display = 'block'; // Still show button without time
                }
            });
        } catch (error) {
            console.error('[GWAR-API] Travel Time Error:', error);
            section.style.display = 'block';
        }

    }, (error) => {
        console.warn('[GWAR-API] Geolocation permission denied or failed:', error.message);
        section.style.display = 'block'; // Show button even if time is unknown
    }, {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 0
    });
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


