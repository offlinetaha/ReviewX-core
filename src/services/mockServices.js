import { GoogleGenerativeAI } from "@google/generative-ai";

// ─── Constants ────────────────────────────────────────────────────────────────
const MOCK_DATA_KEY = 'reviewx_mock_data';
const VOTES_KEY     = 'reviewx_votes';
const USE_MOCK      = import.meta.env.VITE_USE_MOCK_API === 'true';

// ─── Mock Response Templates (5 varied scenarios) ─────────────────────────────
const MOCK_RESPONSES = [
    {
        complaints: [
            "Wait times are consistently too long, especially on weekends",
            "Staff communication needs improvement — customers feel ignored",
            "Pricing feels steep compared to similar competitors nearby"
        ],
        praises: [
            "Food quality is exceptional and consistently well-prepared",
            "The atmosphere and interior design create a great ambiance",
            "Loyal customers love the regular promotions and loyalty perks"
        ],
        thingsToChange: [
            "Add a reservation system to reduce walk-in wait frustration",
            "Train front-of-house staff on proactive customer communication",
            "Introduce a value-tier menu option to address pricing concerns",
            "Set up a real-time wait-time display visible from the entrance",
            "Streamline the billing process to eliminate errors and confusion"
        ],
        thingsToMaintain: [
            "Consistently high food quality — this is your biggest differentiator",
            "The warm, well-curated ambiance that keeps customers coming back",
            "Loyalty promotions that reward regular patrons",
            "Signature dishes customers specifically name in positive reviews",
            "The inviting interior design that drives social media shares"
        ],
        actionPlan: "Hire 1–2 additional staff for peak hours to cut wait times by 40% and immediately win back frustrated regulars.",
        sentimentScore: "7/10"
    },
    {
        complaints: [
            "Product packaging arrived damaged in multiple orders",
            "Customer support response time exceeds 48 hours too often",
            "The checkout process has too many steps and feels confusing"
        ],
        praises: [
            "Product quality is outstanding — customers rave about durability",
            "Free shipping option is a huge differentiator loved by all",
            "Easy returns process makes customers feel safe purchasing"
        ],
        thingsToChange: [
            "Switch to reinforced packaging to prevent transit damage",
            "Implement live chat support to cut response times under 2 hours",
            "Reduce checkout to 3 steps maximum with a progress indicator",
            "Add real-time order tracking with push notifications",
            "Create a dedicated FAQ page to deflect repetitive support tickets"
        ],
        thingsToMaintain: [
            "Product durability — customers cite it as a core reason for repeat purchases",
            "Free shipping tier — a top-cited reason for choosing you over competitors",
            "Hassle-free returns policy that builds purchase confidence",
            "Product accuracy — items match descriptions and photos",
            "Fast dispatch times that regularly earn 5-star shipping reviews"
        ],
        actionPlan: "Upgrade your packaging supplier and set up a live chat widget to slash support tickets by 30% within one month.",
        sentimentScore: "6/10"
    },
    {
        complaints: [
            "App crashes on older Android devices running OS below 10",
            "Dark mode is missing — a common and vocal user request",
            "Notification spam frustrates users who want to control alerts"
        ],
        praises: [
            "Onboarding flow is praised as the smoothest in its category",
            "UI is clean, modern, and praised for its intuitive design",
            "Sync across devices works flawlessly and builds deep trust"
        ],
        thingsToChange: [
            "Fix crashes on Android OS 8 and 9 with a targeted compatibility patch",
            "Ship dark mode in the next release — it's the most-requested feature",
            "Add granular notification controls so users only receive what they want",
            "Reduce app cold-start time which users cite as sluggish on mid-range phones",
            "Add an in-app feedback button to capture issues before they become reviews"
        ],
        thingsToMaintain: [
            "Best-in-class onboarding — users reach their first win in under 5 minutes",
            "Clean, modern UI that feels premium compared to the competition",
            "Seamless cross-device sync that users describe as 'just works'",
            "Regular feature update cadence that shows users you are listening",
            "Minimal permission requests that build user privacy trust"
        ],
        actionPlan: "Prioritize a dark mode and granular notification settings in the next sprint to turn your biggest detractors into vocal promoters.",
        sentimentScore: "8/10"
    },
    {
        complaints: [
            "Menu items frequently listed as unavailable after ordering",
            "Tables feel cramped and the noise level is uncomfortably high",
            "Bills occasionally have inconsistencies that confuse customers"
        ],
        praises: [
            "Chefs are incredibly talented — signature dishes are unforgettable",
            "Staff is warm, friendly, and makes every customer feel at home",
            "Location is perfect — central, easy parking, great foot traffic"
        ],
        thingsToChange: [
            "Sync the POS system with kitchen stock to hide unavailable items live",
            "Rearrange the floor plan to give tables more comfortable spacing",
            "Introduce acoustic panels or soft furnishings to reduce noise levels",
            "Audit the billing system to fix recurring charge discrepancies",
            "Add a digital menu with real-time availability to set expectations early"
        ],
        thingsToMaintain: [
            "Chef talent and dish quality — the food is universally praised",
            "Staff warmth and friendliness — customers consistently feel valued",
            "Prime location advantage — easy access drives spontaneous visits",
            "Signature dishes that customers return specifically to experience",
            "The overall dining atmosphere that earns emotional loyalty"
        ],
        actionPlan: "Implement a real-time inventory sync system to eliminate out-of-stock surprises and instantly boost order satisfaction scores.",
        sentimentScore: "7.5/10"
    },
    {
        complaints: [
            "Subscription cancellation is difficult and buried in settings",
            "No offline mode available — product unusable without internet",
            "Onboarding tutorial skips key advanced features entirely"
        ],
        praises: [
            "Core functionality exceeds competitor products at this price point",
            "Regular feature updates show a responsive and caring team",
            "Analytics dashboard is described as best-in-class by power users"
        ],
        thingsToChange: [
            "Add a one-click cancellation option to reduce churn-related frustration",
            "Build a 30-second offline buffer mode for critical core features",
            "Expand the onboarding tutorial to cover the top 5 power-user features",
            "Add a public product roadmap so users see their requests being acted on",
            "Improve mobile responsiveness — several layouts break on smaller screens"
        ],
        thingsToMaintain: [
            "Exceptional core product value that justifies the price point",
            "Frequent update cadence that keeps users engaged and trusting",
            "Best-in-class analytics dashboard that power users champion internally",
            "Responsive support team with high satisfaction scores",
            "Clean API that developer users praise for reliability and documentation"
        ],
        actionPlan: "Add a one-click cancellation flow and a 30-second offline buffer mode to prevent churn from your highest-value users.",
        sentimentScore: "9/10"
    }
];

// ─── Real Gemini AI ───────────────────────────────────────────────────────────
let genAI = null;

function getGenAI() {
    if (!genAI) {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error(
                "Gemini API key is missing. Add VITE_GEMINI_API_KEY to .env.local, " +
                "or set VITE_USE_MOCK_API=true to test without a key."
            );
        }
        genAI = new GoogleGenerativeAI(apiKey);
    }
    return genAI;
}

async function realAnalyzeReviews(text) {
    const ai = getGenAI();
    const models = ["gemini-2.0-flash-lite", "gemini-1.5-flash", "gemini-1.5-flash-8b"];
    const prompt = `You are a review analysis expert. Analyze the following customer reviews and return ONLY a valid JSON object with no extra text or markdown formatting.

The JSON must have this exact structure:
{
  "complaints": ["complaint 1", "complaint 2", "complaint 3"],
  "praises": ["praise 1", "praise 2", "praise 3"],
  "thingsToChange": ["change 1", "change 2", "change 3", "change 4", "change 5"],
  "thingsToMaintain": ["maintain 1", "maintain 2", "maintain 3", "maintain 4", "maintain 5"],
  "actionPlan": "A 1-sentence strategic owner action plan.",
  "sentimentScore": "X/10"
}

Rules:
- thingsToChange: the top 5 specific, actionable improvements the business should make immediately.
- thingsToMaintain: the top 5 things the business is doing well and must never stop doing.

Customer reviews to analyze:
${text}`;

    let lastError = null;
    for (const modelName of models) {
        try {
            console.log(`[ReviewX] Trying model: ${modelName}`);
            const model = ai.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(prompt);
            const responseText = result.response.text();
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (jsonMatch) return JSON.parse(jsonMatch[0]);
            throw new Error("AI returned an unexpected format.");
        } catch (err) {
            console.warn(`[ReviewX] Model ${modelName} failed: ${err.message}`);
            lastError = err;
        }
    }
    throw new Error(`All AI models are rate-limited. Wait a minute and try again. (${lastError?.message})`);
}

// ─── Mock AI ──────────────────────────────────────────────────────────────────
async function mockAnalyzeReviews() {
    // Simulate network latency so the loading state is visible (900–1700 ms)
    await new Promise((res) => setTimeout(res, 900 + Math.random() * 800));
    return { ...MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)] };
}

// ─── Public API ───────────────────────────────────────────────────────────────
export const mockAiService = {
    /** Returns true when the app is running in mock mode (no API key needed). */
    isMockMode: () => USE_MOCK,

    /** Analyze reviews — uses fake data in mock mode, real Gemini otherwise. */
    analyzeReviews: async (text) => {
        const result = USE_MOCK
            ? await mockAnalyzeReviews()
            : await realAnalyzeReviews(text);
        return {
            ...result,
            timestamp: new Date().toLocaleString(),
            isMock: USE_MOCK,
        };
    }
};

// ─── DB Service (localStorage) ────────────────────────────────────────────────
const PRO_STATUS_KEY = 'reviewx_pro_status';
export const mockDbService = {
    getAnalyses: () => {
        const data = localStorage.getItem(MOCK_DATA_KEY);
        return data ? JSON.parse(data) : [];
    },
    saveAnalysis: (analysis) => {
        const existing = mockDbService.getAnalyses();
        const updated = [analysis, ...existing];
        localStorage.setItem(MOCK_DATA_KEY, JSON.stringify(updated));
        return updated;
    },
    clearHistory: () => localStorage.removeItem(MOCK_DATA_KEY),

    getVotes: () => {
        const data = localStorage.getItem(VOTES_KEY);
        return data ? JSON.parse(data) : { positive: 0, negative: 0 };
    },
    addVote: (type) => {
        const votes = mockDbService.getVotes();
        if (type === 'positive') votes.positive += 1;
        else if (type === 'negative') votes.negative += 1;
        localStorage.setItem(VOTES_KEY, JSON.stringify(votes));
        return votes;
    },
    getTotals: () => {
        const votes = mockDbService.getVotes();
        const total = votes.positive + votes.negative;
        const posPercent = total === 0 ? 0 : Math.round((votes.positive / total) * 100);
        const negPercent = total === 0 ? 0 : 100 - posPercent;
        return { ...votes, total, posPercent, negPercent };
    },

    // ── Pro / Paywall State ───────────────────────────────────────────────────
    isPro: () => {
        return localStorage.getItem(PRO_STATUS_KEY) === 'true';
    },
    upgradeToPro: () => {
        localStorage.setItem(PRO_STATUS_KEY, 'true');
    },
    getFreeAnalysesUsed: () => {
        return mockDbService.getAnalyses().length;
    },
    canAnalyze: () => {
        return mockDbService.isPro() || mockDbService.getFreeAnalysesUsed() < 2;
    }
};
