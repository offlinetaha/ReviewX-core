// ─── Platform Detection ───────────────────────────────────────────────────────

export const PLATFORMS = {
    GOOGLE_MAPS:  { id: 'google_maps',  label: 'Google Maps',   color: 'text-blue-400',   bg: 'bg-blue-500/10 border-blue-500/30',   emoji: '📍' },
    YELP:         { id: 'yelp',         label: 'Yelp',          color: 'text-red-400',    bg: 'bg-red-500/10 border-red-500/30',     emoji: '⭐' },
    PLAY_STORE:   { id: 'play_store',   label: 'Play Store',    color: 'text-green-400',  bg: 'bg-green-500/10 border-green-500/30', emoji: '🤖' },
    APP_STORE:    { id: 'app_store',    label: 'App Store',     color: 'text-sky-400',    bg: 'bg-sky-500/10 border-sky-500/30',     emoji: '🍎' },
    AMAZON:       { id: 'amazon',       label: 'Amazon',        color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/30',emoji: '📦' },
    TRIPADVISOR:  { id: 'tripadvisor',  label: 'TripAdvisor',   color: 'text-emerald-400',bg: 'bg-emerald-500/10 border-emerald-500/30',emoji: '✈️' },
    UNKNOWN:      { id: 'unknown',      label: 'Unknown',       color: 'text-gray-400',   bg: 'bg-gray-500/10 border-gray-500/30',   emoji: '🌐' },
};

/**
 * Detect which review platform a URL belongs to.
 * @param {string} url
 * @returns {object} - One of the PLATFORMS values
 */
export function detectPlatform(url) {
    if (!url) return PLATFORMS.UNKNOWN;
    const u = url.toLowerCase();
    if (u.includes('google.com/maps') || u.includes('maps.google') || u.includes('goo.gl/maps')) return PLATFORMS.GOOGLE_MAPS;
    if (u.includes('yelp.com'))        return PLATFORMS.YELP;
    if (u.includes('play.google.com')) return PLATFORMS.PLAY_STORE;
    if (u.includes('apps.apple.com'))  return PLATFORMS.APP_STORE;
    if (u.includes('amazon.com') || u.includes('amazon.co')) return PLATFORMS.AMAZON;
    if (u.includes('tripadvisor.com')) return PLATFORMS.TRIPADVISOR;
    return PLATFORMS.UNKNOWN;
}

/**
 * Try to extract a human-readable business/product name from the URL.
 * Falls back to the hostname if nothing better is found.
 */
export function extractNameFromUrl(url) {
    try {
        const parsed = new URL(url);
        // Google Maps: /maps/place/Business+Name/@...
        const mapMatch = parsed.pathname.match(/\/maps\/place\/([^/@]+)/);
        if (mapMatch) return decodeURIComponent(mapMatch[1].replace(/\+/g, ' '));
        // Yelp: /biz/business-name-city
        const yelpMatch = parsed.pathname.match(/\/biz\/([^/?]+)/);
        if (yelpMatch) return yelpMatch[1].replace(/-/g, ' ');
        // Play Store: ?id=com.company.appname
        const playId = parsed.searchParams.get('id');
        if (playId) return playId.split('.').pop();
        // App Store: /app/app-name/id...
        const appleMatch = parsed.pathname.match(/\/app\/([^/]+)\//);
        if (appleMatch) return appleMatch[1].replace(/-/g, ' ');
        // Amazon: /dp/ or product in path
        const asinMatch = parsed.pathname.match(/\/([A-Z0-9]{10})\//);
        if (asinMatch) return `Product ${asinMatch[1]}`;
        // TripAdvisor: /Restaurant_Review-...
        const taMatch = parsed.pathname.match(/(?:Hotel|Restaurant|Attraction)_Review-[^/]*-([^.]+)/);
        if (taMatch) return taMatch[1].replace(/_/g, ' ');
        return parsed.hostname.replace('www.', '');
    } catch {
        return 'the business';
    }
}

// ─── Mock Review Banks ─────────────────────────────────────────────────────────

const MOCK_REVIEW_BANKS = {
    google_maps: [
        "Absolutely loved this place! The pasta was divine and the staff were so welcoming. Will definitely return.",
        "Great ambiance and good food, but the wait time was almost 40 minutes on a Friday night. Needs more staff.",
        "Food quality has gone downhill over the past few months. My last two orders were disappointing.",
        "The location is perfect and parking is easy. Staff is always smiling and professional.",
        "Prices are on the higher end but the quality matches. Signature dishes are phenomenal.",
        "Tried calling to make a reservation and nobody picked up. Walk-in wait was over an hour.",
        "Best brunch spot in the city! The eggs benedict alone is worth the trip.",
        "Tables are too close together — you can hear every word from the next table over.",
        "My go-to spot for date nights. Atmosphere is romantic and the wine list is excellent.",
        "Kitchen messed up our order twice. Manager was apologetic but it ruined the experience.",
        "The dessert menu is world-class. Chocolate lava cake was absolutely unforgettable.",
        "Service was excellent — our waiter remembered our names and preferences from last visit!",
    ],
    yelp: [
        "4/5 — Solid spot, solid food. Service could be quicker during lunch rush.",
        "I've been coming here for 3 years and the quality has always been consistent. Highly recommend!",
        "Overpriced for what you get. The 'gourmet' burger was just a regular patty with fancy toppings.",
        "Staff is hit or miss. Got amazing service last time, rude server this time.",
        "The happy hour deals are incredible. Half-off appetizers between 4-6pm is a steal.",
        "Gluten-free options are limited and staff aren't very knowledgeable about allergens.",
        "Beautifully decorated interior. Perfect for Instagram photos and impressing a date.",
        "They never answer the phone. Had to walk in to confirm my reservation was even real.",
        "Best clam chowder in town, hands down. Worth the drive from the suburbs.",
        "Restrooms were not clean. For a restaurant at this price point, that's inexcusable.",
    ],
    play_store: [
        "5 stars! This app changed how I manage my workflow. Super intuitive, no learning curve.",
        "Crashes on my Samsung Galaxy S21 every time I try to upload a file. Very frustrating.",
        "The free tier is too limited. You hit the paywall after 3 uses which feels manipulative.",
        "Dark mode update was a game-changer. Sleep so much better now without the eye strain.",
        "Customer support never responded to my email about a billing issue. Still unresolved.",
        "Sync across my phone and tablet works perfectly. Love the seamless experience.",
        "The latest update broke the notification system. I'm missing important alerts now.",
        "Best app in its category by far. The AI features are miles ahead of competitors.",
        "Too many ads in the free version. Every other screen has a full-page ad.",
        "Login issues after the last update — took 3 days of password resets to get back in.",
        "The onboarding tutorial is the best I've seen. Had me productive in under 5 minutes.",
        "Battery drain is significant. App uses 30% of my battery even when running in background.",
    ],
    app_store: [
        "Beautifully designed app. Feels at home on iOS and the haptics are perfectly tuned.",
        "Why is there no iPad support? The iPhone version scaled up looks terrible.",
        "Works offline which is huge for me. Saved my life during a long flight.",
        "The widget broke after the iOS 17 update and hasn't been fixed in 2 months.",
        "Smoothest onboarding I've experienced on any app. Absolutely love the UX.",
        "Subscription is $9.99/month which feels steep for what it offers vs. competitors.",
        "Face ID login works instantly every time. Great security UX.",
        "After the last update, the app crashes on launch. 1 star until it's fixed.",
        "The team listens to feedback. Every major feature request has been shipped.",
        "No way to export your data, which is a dealbreaker for me.",
    ],
    amazon: [
        "Exceeded my expectations! Build quality is superb for the price point.",
        "Arrived with a cracked screen. Packaging was clearly insufficient for this product type.",
        "Worked perfectly for 2 weeks and then completely stopped functioning. Returned immediately.",
        "Best value in its category. I've bought three of these, one for each family member.",
        "The product photos are misleading — the actual color is much darker than shown.",
        "Setup was incredibly easy. Had it running in under 10 minutes.",
        "Customer service was fast and helpful when I had an issue. Great brand support.",
        "Feels cheap despite the premium price. The plastic housing feels flimsy.",
        "Instructions are unclear and the online support docs are even worse.",
        "Exactly as advertised. Accurate sizing, correct color, fast shipping.",
        "The battery life is half of what they claim in the listing. False advertising.",
        "Bought as a gift and the recipient absolutely loves it. Will buy again.",
    ],
    tripadvisor: [
        "Must-visit! The panoramic view from the rooftop alone is worth the price.",
        "Overrated tourist trap. Locals warned us and they were right.",
        "Staff couldn't be friendlier. Went out of their way to recommend local hidden gems.",
        "The hotel room smelled musty and the AC was unreliable. Not worth the 4-star rating.",
        "Perfect location for exploring the city. Walked to 5 major attractions from the front door.",
        "Breakfast buffet was outstanding — probably the best hotel breakfast I've had in Europe.",
        "The pool was closed for 'maintenance' despite being advertised as open in our booking.",
        "Check-in was seamless, room was immaculate, and the concierge was extraordinarily helpful.",
        "Noise from the street made sleep impossible. Bring earplugs if you stay here.",
        "Absolutely stunning property. Every detail was considered. Our anniversary was perfect.",
    ],
    unknown: [
        "Very positive experience overall. Would recommend to friends and family.",
        "Decent but not exceptional. There's room for improvement in key areas.",
        "Poor customer service. My issue was never resolved despite multiple attempts.",
        "Exceeded all my expectations. This is now my go-to choice.",
        "Quality has declined noticeably compared to a year ago.",
        "Great value for the price. Hard to find a better deal.",
        "Inconsistent experience — sometimes great, sometimes disappointing.",
        "The team clearly cares about their customers. Fast response and resolution.",
    ],
};

// ─── Core Scraper ──────────────────────────────────────────────────────────────

const USE_MOCK = import.meta.env.VITE_USE_MOCK_API === 'true';

/**
 * Fetch reviews from a URL.
 * - Mock mode: returns realistic fake reviews based on the detected platform.
 * - Real mode: calls SerpApi (requires VITE_SERPAPI_KEY in .env.local).
 *
 * @param {string} url - The review page URL
 * @returns {{ platform, businessName, reviews: string[], rawCount: number }}
 */
export async function scrapeReviews(url) {
    const platform = detectPlatform(url);
    const businessName = extractNameFromUrl(url);

    if (USE_MOCK) {
        return await mockScrape(url, platform, businessName);
    } else {
        return await realScrape(url, platform, businessName);
    }
}

// ─── Mock Scraper ──────────────────────────────────────────────────────────────

async function mockScrape(url, platform, businessName) {
    // Simulate a real scrape delay
    const delay = 1200 + Math.random() * 1000;
    await new Promise((res) => setTimeout(res, delay));

    const bank = MOCK_REVIEW_BANKS[platform.id] || MOCK_REVIEW_BANKS.unknown;
    // Shuffle and pick 8–12 reviews
    const shuffled = [...bank].sort(() => 0.5 - Math.random());
    const count = 8 + Math.floor(Math.random() * 5);
    const reviews = shuffled.slice(0, Math.min(count, shuffled.length));

    return {
        platform,
        businessName,
        reviews,
        rawCount: reviews.length,
        isMock: true,
    };
}

// ─── Real Scraper (SerpApi) ────────────────────────────────────────────────────

async function realScrape(url, platform, businessName) {
    const serpApiKey = import.meta.env.VITE_SERPAPI_KEY;
    if (!serpApiKey) {
        throw new Error(
            'SerpApi key is missing. Add VITE_SERPAPI_KEY to your .env.local file, ' +
            'or set VITE_USE_MOCK_API=true to test without a key.'
        );
    }

    // Route to the correct SerpApi engine based on platform
    if (platform.id === 'google_maps') {
        return await scrapeGoogleMaps(url, businessName, serpApiKey, platform);
    }
    if (platform.id === 'play_store') {
        return await scrapePlayStore(url, businessName, serpApiKey, platform);
    }

    // For Yelp, App Store, Amazon, TripAdvisor: 
    // These require Apify or Bright Data actors. For now, fall back to a helpful error.
    throw new Error(
        `Live scraping for ${platform.label} is not yet supported. ` +
        `Use VITE_USE_MOCK_API=true to test, or contribute a scraper for this platform.`
    );
}

async function scrapeGoogleMaps(url, businessName, apiKey, platform) {
    // SerpApi Google Maps Reviews endpoint requires a `data_id`.
    // We first search for the place to get its data_id, then fetch reviews.
    const searchUrl = `https://serpapi.com/search.json?engine=google_maps&q=${encodeURIComponent(businessName)}&api_key=${apiKey}`;
    const searchRes = await fetch(searchUrl);
    if (!searchRes.ok) throw new Error(`SerpApi search failed (${searchRes.status})`);
    const searchData = await searchRes.json();

    const place = searchData.local_results?.[0];
    if (!place?.data_id) {
        throw new Error(`Could not find "${businessName}" on Google Maps via SerpApi.`);
    }

    const reviewsUrl = `https://serpapi.com/search.json?engine=google_maps_reviews&data_id=${place.data_id}&api_key=${apiKey}`;
    const reviewsRes = await fetch(reviewsUrl);
    if (!reviewsRes.ok) throw new Error(`SerpApi reviews fetch failed (${reviewsRes.status})`);
    const reviewsData = await reviewsRes.json();

    const reviews = (reviewsData.reviews || [])
        .slice(0, 15)
        .map((r) => r.snippet || r.text || '')
        .filter(Boolean);

    return { platform, businessName: place.title || businessName, reviews, rawCount: reviews.length, isMock: false };
}

async function scrapePlayStore(url, businessName, apiKey, platform) {
    const reviewsUrl = `https://serpapi.com/search.json?engine=google_play_product&product_id=${encodeURIComponent(businessName)}&store=apps&api_key=${apiKey}`;
    const res = await fetch(reviewsUrl);
    if (!res.ok) throw new Error(`SerpApi Play Store fetch failed (${res.status})`);
    const data = await res.json();

    const reviews = (data.reviews || [])
        .slice(0, 15)
        .map((r) => r.text || '')
        .filter(Boolean);

    return { platform, businessName, reviews, rawCount: reviews.length, isMock: false };
}
