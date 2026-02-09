import { loadInstagramFeed, loadGoogleReviews, loadTravelTime, loadWeather } from './api.js?v=13';


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
            const position = { lat: 50.0483, lng: 19.9455 }; // Mostowa 8
            const map = new google.maps.Map(mapDiv, {
                zoom: 15,
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




function setLanguage(lang) {
    if (currentLang === lang) return;
    currentLang = lang;

    // Update UI active state
    document.querySelectorAll('.flag-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });

    const url = (lang === 'pl') ? 'pdf/menu_pl.pdf' : 'pdf/menu_en.pdf';
    loadPDF(url);
}

// Make setLanguage global so inline HTML clicks work (if keeping that pattern) 
// or better, bind it in JS. Let's bind in JS.
window.setLanguage = setLanguage; // For backward compatibility if needed

function initPDF() {
    // Bind click events for flags if they exist
    document.querySelectorAll('.flag-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const lang = e.currentTarget.dataset.lang;
            setLanguage(lang);
        });
    });

    // Initial load
    setLanguage('pl');
}

function loadPDF(url) {
    if (!pdfContainer) return;

    pdfContainer.innerHTML = '<div style="color:white; text-align:center; padding:20px;">Ładowanie menu...</div>';

    // Check if pdfjsLib is loaded
    if (typeof pdfjsLib === 'undefined') {
        console.error('PDF.js library not loaded');
        pdfContainer.innerHTML = '<div style="color:red; text-align:center;">Błąd ładowania silnika PDF.</div>';
        return;
    }

    pdfjsLib.getDocument(url).promise.then(pdf => {
        pdfDoc = pdf;
        pdfContainer.innerHTML = ""; // Clear loader
        for (let i = 1; i <= pdf.numPages; i++) {
            renderPage(i);
        }
    }).catch(err => {
        console.error("PDF load error:", err);
        pdfContainer.innerHTML = `<div style="color:red; text-align:center;">Nie udało się załadować PDF: ${url}</div>`;
    });
}

function renderPage(num) {
    pdfDoc.getPage(num).then(page => {
        // Calculate scale to fit container width
        const containerWidth = pdfContainer.clientWidth || window.innerWidth;
        const unscaledViewport = page.getViewport({ scale: 1 });
        const scale = (containerWidth - 20) / unscaledViewport.width; // -20 for padding safety
        const viewport = page.getViewport({ scale: scale });

        // HiDPI rendering
        const outputScale = window.devicePixelRatio || 1;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = Math.floor(viewport.width * outputScale);
        canvas.height = Math.floor(viewport.height * outputScale);

        canvas.style.width = viewport.width + 'px';
        canvas.style.height = viewport.height + 'px';

        const transform = outputScale !== 1
            ? [outputScale, 0, 0, outputScale, 0, 0]
            : null;

        pdfContainer.appendChild(canvas);

        page.render({
            canvasContext: ctx,
            viewport: viewport,
            transform: transform
        });
    });
}

// Handle resize
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        const url = (currentLang === 'pl') ? 'pdf/menu_pl.pdf' : 'pdf/menu_en.pdf';
        loadPDF(url);
    }, 150);
});
