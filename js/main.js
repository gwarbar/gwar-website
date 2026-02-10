import { loadInstagramFeed, loadGoogleReviews, loadTravelTime, loadWeather } from './api.js?v=13';
import { TRANSLATIONS } from './translations.js';


// PDF Handling
let pdfDoc = null;
let currentLang = null;

const pdfContainer = document.getElementById('pdfContainer');

// Navigation & UI
document.addEventListener('DOMContentLoaded', () => {
    // Configure PDF.js worker
    if (typeof pdfjsLib !== 'undefined') {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
    }

    // Load Social & Weather Data
    loadInstagramFeed();
    loadWeather();

    // Google Social & Maps Loading Strategy
    if (window.isGoogleMapsLoaded && window.google) {
        loadGoogleReviews();
        loadTravelTime();
    } else {
        window.onMapsLoadedCallback = () => {
            loadGoogleReviews();
            loadTravelTime();
        };
    }

    // Mobile Menu Toggle
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // Close mobile menu when link is clicked
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
        });
    });

    // Initialize PDF
    initPDF();

    // FORM HANDLING (AJAX)
    const form = document.querySelector('#reservation-form');
    const statusDiv = document.querySelector('#form-status');

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const btn = form.querySelector('button');
            const originalText = btn.textContent;
            btn.textContent = 'WYSYŁANIE...';
            btn.disabled = true;
            statusDiv.style.display = 'none';

            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            // COMBINE HOUR + MINUTE into 'time' for the backend
            if (data.hour && data.minute) {
                data.time = `${data.hour}:${data.minute}`;
            }

            try {
                const response = await fetch(form.action, {
                    method: 'POST',
                    body: JSON.stringify(data),
                    headers: {
                        'Content-Type': 'text/plain;charset=utf-8',
                    }
                });

                if (response.ok) {
                    const result = await response.json();
                    if (result.result === 'success') {
                        statusDiv.innerHTML = '<span style="color:var(--primary-color);">Potwierdzono, odezwiemy się.</span>';
                        statusDiv.style.display = 'block';
                        form.reset();
                        // Reset Pax Input if needed
                        const paxSelect = document.getElementById('pax-select');
                        const paxInput = document.getElementById('pax-input');
                        if (paxSelect && paxInput) {
                            paxSelect.style.display = 'block';
                            paxSelect.setAttribute('name', 'pax');
                            paxSelect.setAttribute('required', 'true');
                            paxInput.style.display = 'none';
                            paxInput.removeAttribute('name');
                            paxInput.removeAttribute('required');
                            paxSelect.value = "";
                        }

                    } else {
                        throw new Error(result.error);
                    }
                } else {
                    throw new Error('Server returned ' + response.status);
                }
            } catch (error) {
                console.error("Submission Error:", error);
                statusDiv.innerHTML = '<span style="color:red;">Błąd. Spróbuj ponownie.</span>';
                statusDiv.style.display = 'block';
            } finally {
                btn.textContent = originalText;
                btn.disabled = false;
            }
        });
    }

    // GENERATE HOURS (12 to 23)
    const hourSelect = document.getElementById('hour');
    if (hourSelect) {
        const startHour = 12;
        const endHour = 23;

        for (let h = startHour; h <= endHour; h++) {
            const hourStr = h.toString();
            const option = document.createElement('option');
            option.value = hourStr;
            option.textContent = hourStr;
            hourSelect.appendChild(option);
        }
    }

    // PAX TOGGLE LOGIC
    const paxSelect = document.getElementById('pax-select');
    const paxInput = document.getElementById('pax-input');

    if (paxSelect && paxInput) {
        paxSelect.addEventListener('change', () => {
            if (paxSelect.value === 'custom') {
                // Switch to Input
                paxSelect.style.display = 'none';
                paxSelect.removeAttribute('name');
                paxSelect.removeAttribute('required');

                paxInput.style.display = 'block';
                paxInput.setAttribute('name', 'pax');
                paxInput.setAttribute('required', 'true');
                paxInput.focus();
            }
        });
    }

    // INIT MINI MAP (If Google Maps is loaded)
    const initContactMap = () => {
        const mapDiv = document.getElementById('contact-map');
        if (mapDiv && window.google) {
            // Updated coordinates from Google Maps link
            const position = { lat: 50.0480326, lng: 19.9460358 };
            const map = new google.maps.Map(mapDiv, {
                zoom: 18, // Zoomed in closer for better detail
                center: position,
                disableDefaultUI: true, // Clean look
                styles: [
                    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
                    { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
                    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
                    {
                        featureType: "administrative.locality",
                        elementType: "labels.text.fill",
                        stylers: [{ color: "#d59563" }],
                    },
                    {
                        featureType: "poi",
                        elementType: "labels.text.fill",
                        stylers: [{ color: "#d59563" }],
                    },
                    {
                        featureType: "poi.park",
                        elementType: "geometry",
                        stylers: [{ color: "#263c3f" }],
                    },
                    {
                        featureType: "poi.park",
                        elementType: "labels.text.fill",
                        stylers: [{ color: "#6b9a76" }],
                    },
                    {
                        featureType: "road",
                        elementType: "geometry",
                        stylers: [{ color: "#38414e" }],
                    },
                    {
                        featureType: "road",
                        elementType: "geometry.stroke",
                        stylers: [{ color: "#212a37" }],
                    },
                    {
                        featureType: "road",
                        elementType: "labels.text.fill",
                        stylers: [{ color: "#9ca5b3" }],
                    },
                    {
                        featureType: "road.highway",
                        elementType: "geometry",
                        stylers: [{ color: "#746855" }],
                    },
                    {
                        featureType: "road.highway",
                        elementType: "geometry.stroke",
                        stylers: [{ color: "#1f2835" }],
                    },
                    {
                        featureType: "road.highway",
                        elementType: "labels.text.fill",
                        stylers: [{ color: "#f3d19c" }],
                    },
                    {
                        featureType: "transit",
                        elementType: "geometry",
                        stylers: [{ color: "#2f3948" }],
                    },
                    {
                        featureType: "transit.station",
                        elementType: "labels.text.fill",
                        stylers: [{ color: "#d59563" }],
                    },
                    {
                        featureType: "water",
                        elementType: "geometry",
                        stylers: [{ color: "#17263c" }],
                    },
                    {
                        featureType: "water",
                        elementType: "labels.text.fill",
                        stylers: [{ color: "#515c6d" }],
                    },
                    {
                        featureType: "water",
                        elementType: "labels.text.stroke",
                        stylers: [{ color: "#17263c" }],
                    },
                ],
            });
            new google.maps.Marker({
                position: position,
                map: map,
                title: "Bar Gwar"
            });
        }
    };

    if (window.isGoogleMapsLoaded) {
        initContactMap();
    } else {
        // Poll for map availability just in case
        const checkMap = setInterval(() => {
            if (window.google) {
                initContactMap();
                clearInterval(checkMap);
            }
        }, 500);
    }
});




// Use a more robust language switching mechanism
window.setLanguage = setLanguage;

async function setLanguage(lang) {
    if (currentLang === lang && !pdfContainer) return; // Skip if same lang and no PDF re-render needed

    currentLang = lang;
    localStorage.setItem('gwar_language', lang); // Save preference

    // Update UI active state
    document.querySelectorAll('.flag-btn').forEach(btn => {
        const isActive = btn.dataset.lang === lang;
        btn.classList.toggle('active', isActive);
        btn.style.opacity = isActive ? '1' : '0.5'; // Visual feedback
    });

    // Translate Text Content
    const t = TRANSLATIONS[lang];
    if (t) {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.dataset.i18n;
            if (t[key]) {
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    el.placeholder = t[key];
                } else {
                    el.textContent = t[key];
                }
            }
        });
    }

    // PDF Reload (only if on a page with PDF)
    if (pdfContainer) {
        const url = (lang === 'pl') ? 'pdf/menu_pl.pdf' : 'pdf/menu_en.pdf';
        await loadPDF(url);
    }
}

function initPDF() {
    // Bind click events for flags if they exist
    document.querySelectorAll('.flag-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const lang = e.currentTarget.dataset.lang;
            setLanguage(lang);
        });
    });

    // Initial load from storage or default
    const savedLang = localStorage.getItem('gwar_language') || 'pl';
    setLanguage(savedLang);
}

let currentPdfUrl = null;

async function loadPDF(url) {
    if (!pdfContainer) return;

    // Avoid reloading if same URL (unless forced, but here we assume simple switch)
    // Actually simpler to just reload to be safe with language changes

    currentPdfUrl = url;
    pdfContainer.innerHTML = '<div style="color:white; text-align:center; padding:20px;">' +
        (currentLang === 'en' ? 'Loading menu...' : 'Ładowanie menu...') + '</div>';

    if (typeof pdfjsLib === 'undefined') {
        console.error('PDF.js library not loaded');
        return;
    }

    try {
        const pdf = await pdfjsLib.getDocument(url).promise;
        pdfDoc = pdf;
        pdfContainer.innerHTML = ""; // Clear loader

        // Render pages sequentially to ensure order
        for (let i = 1; i <= pdf.numPages; i++) {
            await renderPage(i);
        }
    } catch (err) {
        console.error("PDF load error:", err);
        pdfContainer.innerHTML = `<div style="color:red; text-align:center;">Failed to load PDF</div>`;
    }
}

async function renderPage(num) {
    try {
        const page = await pdfDoc.getPage(num);

        // Calculate scale
        const containerWidth = pdfContainer.clientWidth || window.innerWidth;
        const unscaledViewport = page.getViewport({ scale: 1 });
        const scale = (containerWidth - 20) / unscaledViewport.width;
        const viewport = page.getViewport({ scale: scale });

        const outputScale = window.devicePixelRatio || 1;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = Math.floor(viewport.width * outputScale);
        canvas.height = Math.floor(viewport.height * outputScale);
        canvas.style.width = viewport.width + 'px';
        canvas.style.height = viewport.height + 'px';
        canvas.style.marginBottom = '20px'; // Add some spacing between pages

        const transform = outputScale !== 1
            ? [outputScale, 0, 0, outputScale, 0, 0]
            : null;

        // wrapper for canvas to center it
        const wrapper = document.createElement('div');
        wrapper.style.display = 'flex';
        wrapper.style.justifyContent = 'center';
        wrapper.style.width = '100%';
        wrapper.appendChild(canvas);

        pdfContainer.appendChild(wrapper);

        await page.render({
            canvasContext: ctx,
            viewport: viewport,
            transform: transform
        }).promise;

    } catch (e) {
        console.error("Error rendering page " + num, e);
    }
}

// Handle resize
// Handle resize with persistence check
let resizeTimeout;
let lastWidth = window.innerWidth;

window.addEventListener('resize', () => {
    // Ignore vertical resize (address bar on mobile)
    if (window.innerWidth === lastWidth) return;
    lastWidth = window.innerWidth;

    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        if (pdfDoc && currentPdfUrl) {
            // Reloading the PDF is the safest way to ensure proper rescale
            loadPDF(currentPdfUrl);
        }
    }, 250);
});
