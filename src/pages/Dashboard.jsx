import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    LogOut,
    Send,
    TrendingUp,
    MessageCircle,
    CheckCircle2,
    AlertCircle,
    Loader2,
    ThumbsUp,
    ThumbsDown,
    BarChart2,
    FlaskConical,
    Trash2,
    Link2,
    FileText,
    Globe,
    Download,
    ArrowUpCircle,
    ShieldCheck,
    Sparkles,
    CreditCard,
    Lock,
    X,
    Star,
    Zap
} from 'lucide-react';
import { mockAiService, mockDbService } from '../services/mockServices';
import { scrapeReviews, detectPlatform, PLATFORMS } from '../services/scraperService';

const IS_MOCK = mockAiService.isMockMode();

// ─── Input Mode Tabs ──────────────────────────────────────────────────────────
const INPUT_MODES = { TEXT: 'text', LINK: 'link' };

const Dashboard = () => {
    const [inputMode, setInputMode] = useState(INPUT_MODES.TEXT);

    // Text mode state
    const [reviews, setReviews] = useState('');

    // Link mode state
    const [linkUrl, setLinkUrl] = useState('');
    const [detectedPlatform, setDetectedPlatform] = useState(null);
    const [scrapeStatus, setScrapeStatus] = useState(''); // '', 'scraping', 'scraped', 'error'
    const [scrapedData, setScrapedData] = useState(null); // { platform, businessName, reviews[], rawCount }

    // Shared state
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState([]);
    const [currentAnalysis, setCurrentAnalysis] = useState(null);
    const [error, setError] = useState('');
    const [selectedVote, setSelectedVote] = useState(null);
    const [voteTotals, setVoteTotals] = useState({ positive: 0, negative: 0, total: 0, posPercent: 0, negPercent: 0 });

    // Paywall state
    const [showPaywall, setShowPaywall] = useState(false);
    const [isPro, setIsPro] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        if (!localStorage.getItem('isAuthenticated')) navigate('/login');
        setHistory(mockDbService.getAnalyses());
        setVoteTotals(mockDbService.getTotals());
        setIsPro(mockDbService.isPro());
    }, [navigate]);

    // Live platform detection as user types
    useEffect(() => {
        if (!linkUrl.trim()) {
            setDetectedPlatform(null);
            setScrapedData(null);
            setScrapeStatus('');
            return;
        }
        try {
            new URL(linkUrl); // validate URL
            setDetectedPlatform(detectPlatform(linkUrl));
        } catch {
            setDetectedPlatform(null);
        }
    }, [linkUrl]);

    // ── Fetch Reviews from Link ──────────────────────────────────────────────
    const handleFetchLink = async () => {
        if (!linkUrl.trim()) return;
        setScrapeStatus('scraping');
        setError('');
        setScrapedData(null);
        try {
            const data = await scrapeReviews(linkUrl);
            setScrapedData(data);
            setScrapeStatus('scraped');
        } catch (err) {
            setError(err.message || 'Failed to fetch reviews from that link.');
            setScrapeStatus('error');
        }
    };

    // ── Analyze (handles both modes) ─────────────────────────────────────────
    const handleAnalyze = async () => {
        let textToAnalyze = '';

        if (inputMode === INPUT_MODES.LINK) {
            if (!scrapedData || scrapedData.reviews.length === 0) return;
            textToAnalyze = scrapedData.reviews.join('\n\n');
        } else {
            if (!reviews.trim()) return;
            textToAnalyze = reviews;
        }

        // Paywall Check
        if (!isPro && !mockDbService.canAnalyze()) {
            setShowPaywall(true);
            return;
        }

        setLoading(true);
        setError('');
        try {
            const result = await mockAiService.analyzeReviews(textToAnalyze);
            const meta = inputMode === INPUT_MODES.LINK && scrapedData
                ? { sourceUrl: linkUrl, platform: scrapedData.platform.label, businessName: scrapedData.businessName }
                : {};

            const updatedHistory = mockDbService.saveAnalysis({
                ...result,
                ...meta,
                id: Date.now(),
                originalText: textToAnalyze.substring(0, 100) + '...',
            });
            setHistory(updatedHistory);
            setCurrentAnalysis({ ...result, ...meta });
            setReviews('');
            setLinkUrl('');
            setScrapedData(null);
            setScrapeStatus('');
            setDetectedPlatform(null);
            setSelectedVote(null);
        } catch (err) {
            setError(err.message || 'Error analyzing reviews. Check your API key.');
        } finally {
            setLoading(false);
        }
    };

    const handleVote = (type) => {
        if (selectedVote === type) return;
        setSelectedVote(type);
        mockDbService.addVote(type);
        setVoteTotals(mockDbService.getTotals());
    };

    const logout = () => {
        localStorage.removeItem('isAuthenticated');
        navigate('/');
    };

    // ── Can we show the Analyze button? ──────────────────────────────────────
    const canAnalyze = inputMode === INPUT_MODES.TEXT
        ? reviews.trim().length > 0
        : scrapedData && scrapedData.reviews.length > 0;

    return (
        <div className="flex h-screen bg-review-dark text-white">

            {/* ── Sidebar ──────────────────────────────────────────────────── */}
            <aside className="w-64 border-r border-white/10 flex flex-col shrink-0">
                <div className="p-6 text-xl font-bold bg-gradient-to-r from-review-purple to-indigo-400 bg-clip-text text-transparent">
                    ReviewX
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-2">
                    <SidebarItem icon={<LayoutDashboard size={20} />} label="Analyze" active />

                    <div className="pt-6 pb-2 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        History
                    </div>
                    <div className="space-y-1 overflow-y-auto max-h-[calc(100vh-280px)]">
                        {history.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setCurrentAnalysis(item)}
                                className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-white/5 text-gray-400 truncate"
                            >
                                {item.platform && (
                                    <span className="mr-1">{PLATFORMS[item.platform.toUpperCase().replace(' ', '_')]?.emoji || '🔗'}</span>
                                )}
                                {item.timestamp?.split(',')[0]} — {item.businessName || item.originalText}
                            </button>
                        ))}
                        {history.length === 0 && (
                            <div className="px-3 py-2 text-sm text-gray-600 italic">No history yet</div>
                        )}
                    </div>
                </nav>

                <div className="p-4 border-t border-white/10">
                    <button onClick={logout} className="flex items-center space-x-2 text-gray-400 hover:text-white w-full px-3 py-2 transition">
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* ── Main Content ──────────────────────────────────────────────── */}
            <main className="flex-1 overflow-y-auto p-8">

                {/* Header */}
                <header className="mb-8 flex items-start justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl font-bold">Review Analysis</h1>
                            {IS_MOCK && (
                                <span
                                    title="Running with mock data — no API key required"
                                    className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                                               bg-amber-500/15 border border-amber-400/40 text-amber-300 animate-pulse"
                                >
                                    <FlaskConical size={13} />
                                    Mock Mode
                                </span>
                            )}
                        </div>
                        <p className="text-gray-400">
                            {IS_MOCK
                                ? 'Simulated AI & scraping — set VITE_USE_MOCK_API=false in .env.local to go live.'
                                : 'Paste reviews or drop a link and let ReviewX handle the rest.'}
                        </p>
                    </div>
                    {history.length > 0 && (
                        <button
                            onClick={() => { mockDbService.clearHistory(); setHistory([]); setCurrentAnalysis(null); }}
                            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-400 border border-white/10 hover:border-red-400/40 px-3 py-1.5 rounded-lg transition shrink-0"
                            title="Clear all saved analyses"
                        >
                            <Trash2 size={13} />
                            Clear History
                        </button>
                    )}
                </header>

                {/* ── Input Mode Toggle ─────────────────────────────────────── */}
                <div className="flex gap-2 mb-4">
                    <ModeTab
                        active={inputMode === INPUT_MODES.TEXT}
                        icon={<FileText size={15} />}
                        label="Paste Text"
                        onClick={() => { setInputMode(INPUT_MODES.TEXT); setError(''); }}
                    />
                    <ModeTab
                        active={inputMode === INPUT_MODES.LINK}
                        icon={<Link2 size={15} />}
                        label="Drop a Link"
                        badge="NEW"
                        onClick={() => { setInputMode(INPUT_MODES.LINK); setError(''); }}
                    />
                </div>

                {/* ── Input Panel ───────────────────────────────────────────── */}
                <div className="glass-morphism rounded-2xl p-6 mb-6">
                    {inputMode === INPUT_MODES.TEXT ? (
                        /* Text Mode */
                        <textarea
                            className="w-full h-40 bg-transparent border-none outline-none resize-none text-gray-200 placeholder-gray-600"
                            placeholder="Paste reviews here... e.g. 'The food was great but the service was slow. Loved the atmosphere!'"
                            value={reviews}
                            onChange={(e) => setReviews(e.target.value)}
                        />
                    ) : (
                        /* Link Mode */
                        <LinkInputPanel
                            linkUrl={linkUrl}
                            setLinkUrl={setLinkUrl}
                            detectedPlatform={detectedPlatform}
                            scrapeStatus={scrapeStatus}
                            scrapedData={scrapedData}
                            onFetch={handleFetchLink}
                        />
                    )}

                    {/* Bottom action bar */}
                    <div className="flex items-center justify-between mt-4 gap-4 pt-4 border-t border-white/5">
                        <div className="flex gap-3">
                            <button
                                id="btn-positive-vote"
                                onClick={() => handleVote('positive')}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm border transition-all duration-200
                                    ${selectedVote === 'positive'
                                        ? 'bg-green-500/20 border-green-400 text-green-300 shadow-[0_0_12px_rgba(74,222,128,0.4)]'
                                        : 'bg-white/5 border-white/10 text-gray-400 hover:border-green-400/50 hover:text-green-300'
                                    }`}
                            >
                                <ThumbsUp size={17} />
                                Positive
                            </button>
                            <button
                                id="btn-negative-vote"
                                onClick={() => handleVote('negative')}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm border transition-all duration-200
                                    ${selectedVote === 'negative'
                                        ? 'bg-red-500/20 border-red-400 text-red-300 shadow-[0_0_12px_rgba(248,113,113,0.4)]'
                                        : 'bg-white/5 border-white/10 text-gray-400 hover:border-red-400/50 hover:text-red-300'
                                    }`}
                            >
                                <ThumbsDown size={17} />
                                Negative
                            </button>
                        </div>

                        <button
                            onClick={handleAnalyze}
                            disabled={loading || !canAnalyze}
                            className="px-6 py-3 bg-review-purple rounded-xl font-bold hover:bg-purple-700 transition flex items-center space-x-2 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    <span>Analyzing...</span>
                                </>
                            ) : (
                                <>
                                    <Sparkles size={20} />
                                    <span>Analyze Reviews</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* ── Review Statistics ─────────────────────────────────────── */}
                <div className="glass-morphism rounded-2xl p-6 mb-8">
                    <div className="flex items-center gap-2 mb-5">
                        <BarChart2 size={20} className="text-review-purple" />
                        <h2 className="font-bold text-lg">Review Statistics</h2>
                        <span className="ml-auto text-sm text-gray-500">{voteTotals.total} total reviews</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-5">
                        <StatCard icon={<ThumbsUp size={20} className="text-green-400" />} count={voteTotals.positive} label="Positive Reviews" pct={voteTotals.posPercent} color="green" />
                        <StatCard icon={<ThumbsDown size={20} className="text-red-400" />} count={voteTotals.negative} label="Negative Reviews" pct={voteTotals.negPercent} color="red" />
                    </div>
                    {voteTotals.total > 0 ? (
                        <div>
                            <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                                <span>Positive {voteTotals.posPercent}%</span>
                                <span>Negative {voteTotals.negPercent}%</span>
                            </div>
                            <div className="w-full h-3 rounded-full bg-white/5 overflow-hidden flex">
                                <div className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-700 ease-in-out rounded-l-full" style={{ width: `${voteTotals.posPercent}%` }} />
                                <div className="h-full bg-gradient-to-r from-red-500 to-rose-400 transition-all duration-700 ease-in-out rounded-r-full" style={{ width: `${voteTotals.negPercent}%` }} />
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-sm text-gray-600 italic pt-2">
                            Mark your first review as Positive or Negative to see stats here.
                        </div>
                    )}
                </div>

                {/* ── Error Banner ──────────────────────────────────────────── */}
                {error && (
                    <div className="glass-morphism rounded-2xl p-4 mb-8 border border-red-500/30 bg-red-500/5 flex items-center space-x-3">
                        <AlertCircle className="text-red-400 shrink-0" />
                        <p className="text-red-300 text-sm">{error}</p>
                    </div>
                )}

                {/* ── Analysis Results ──────────────────────────────────────── */}
                {currentAnalysis && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Source badge (when came from a link) */}
                        {currentAnalysis.businessName && (
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                <Globe size={15} />
                                <span>Analysis for <strong className="text-white">{currentAnalysis.businessName}</strong></span>
                                {currentAnalysis.platform && (
                                    <span className="px-2 py-0.5 rounded-full text-xs bg-white/5 border border-white/10">
                                        {currentAnalysis.platform}
                                    </span>
                                )}
                                {currentAnalysis.isMock && (
                                    <span className="px-2 py-0.5 rounded-full text-xs bg-amber-500/10 border border-amber-400/20 text-amber-400">
                                        mock data
                                    </span>
                                )}
                            </div>
                        )}

                        <div className="grid md:grid-cols-3 gap-6">
                            <ResultCard title="Top Complaints" icon={<AlertCircle className="text-red-400" />} items={currentAnalysis.complaints} bgColor="bg-red-400/5" />
                            <ResultCard title="Top Praises" icon={<CheckCircle2 className="text-green-400" />} items={currentAnalysis.praises} bgColor="bg-green-400/5" />
                            <div className="glass-morphism rounded-2xl p-6 bg-purple-400/5">
                                <div className="flex items-center space-x-2 mb-4">
                                    <TrendingUp className="text-review-purple" />
                                    <h3 className="font-bold">Sentiment Score</h3>
                                </div>
                                <div className="text-5xl font-black text-review-purple mb-2">
                                    {currentAnalysis.sentimentScore}
                                </div>
                                <p className="text-sm text-gray-400">Based on recent feedback analysis</p>
                            </div>
                        </div>

                        {/* Top 5 to Change + Top 5 to Maintain */}
                        {(currentAnalysis.thingsToChange || currentAnalysis.thingsToMaintain) && (
                            <div className="grid md:grid-cols-2 gap-6">
                                {currentAnalysis.thingsToChange && (
                                    <NumberedCard
                                        title="Top 5 to Change"
                                        subtitle="Prioritise these improvements first"
                                        icon={<ArrowUpCircle className="text-orange-400" />}
                                        items={currentAnalysis.thingsToChange}
                                        accentColor="orange"
                                    />
                                )}
                                {currentAnalysis.thingsToMaintain && (
                                    <NumberedCard
                                        title="Top 5 to Maintain"
                                        subtitle="Never stop doing these"
                                        icon={<ShieldCheck className="text-teal-400" />}
                                        items={currentAnalysis.thingsToMaintain}
                                        accentColor="teal"
                                    />
                                )}
                            </div>
                        )}

                        <div className="glass-morphism rounded-2xl p-8 border-review-purple/30 border">
                            <div className="flex items-center space-x-2 mb-4">
                                <MessageCircle className="text-review-purple" />
                                <h3 className="text-xl font-bold">Owner's Action Plan</h3>
                            </div>
                            <p className="text-lg leading-relaxed text-gray-200">
                                "{currentAnalysis.actionPlan}"
                            </p>
                        </div>
                    </div>
                )}

            </main>

            {/* ── Paywall Modal ────────────────────────────────────────────── */}
            {showPaywall && (
                <PaywallModal 
                    onClose={() => setShowPaywall(false)} 
                    onUpgrade={() => {
                        mockDbService.upgradeToPro();
                        setIsPro(true);
                        setShowPaywall(false);
                    }} 
                />
            )}
        </div>
    );
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const ModeTab = ({ active, icon, label, badge, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-200
            ${active
                ? 'bg-review-purple border-review-purple text-white shadow-lg shadow-purple-900/30'
                : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20 hover:text-white'
            }`}
    >
        {icon}
        {label}
        {badge && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-black leading-none">{badge}</span>
        )}
    </button>
);

const LinkInputPanel = ({ linkUrl, setLinkUrl, detectedPlatform, scrapeStatus, scrapedData, onFetch }) => {
    const isLoading = scrapeStatus === 'scraping';

    return (
        <div className="space-y-4">
            {/* URL Input */}
            <div className="flex gap-3">
                <div className="flex-1 relative">
                    <Globe size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                        type="url"
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !isLoading && linkUrl.trim() && onFetch()}
                        placeholder="https://google.com/maps/place/... or yelp.com/biz/..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-200 placeholder-gray-600 outline-none focus:border-review-purple/70 transition"
                    />
                </div>
                <button
                    onClick={onFetch}
                    disabled={isLoading || !linkUrl.trim()}
                    className="flex items-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl text-sm font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                >
                    {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                    {isLoading ? 'Fetching...' : 'Fetch Reviews'}
                </button>
            </div>

            {/* Detected Platform Badge */}
            {detectedPlatform && detectedPlatform.id !== 'unknown' && (
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border ${detectedPlatform.bg} ${detectedPlatform.color}`}>
                    <span>{detectedPlatform.emoji}</span>
                    <span>{detectedPlatform.label} detected</span>
                </div>
            )}
            {detectedPlatform && detectedPlatform.id === 'unknown' && linkUrl && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border bg-gray-500/10 border-gray-500/30 text-gray-400">
                    🌐 Platform unknown — will attempt generic scrape
                </div>
            )}

            {/* Supported Platforms hint */}
            {!linkUrl && (
                <div className="flex flex-wrap gap-2 pt-1">
                    {[PLATFORMS.GOOGLE_MAPS, PLATFORMS.YELP, PLATFORMS.PLAY_STORE, PLATFORMS.APP_STORE, PLATFORMS.AMAZON, PLATFORMS.TRIPADVISOR].map((p) => (
                        <span key={p.id} className={`px-2 py-1 rounded-lg text-xs border ${p.bg} ${p.color}`}>
                            {p.emoji} {p.label}
                        </span>
                    ))}
                </div>
            )}

            {/* Scraped reviews preview */}
            {scrapeStatus === 'scraped' && scrapedData && (
                <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-4 space-y-3">
                    <div className="flex items-center gap-2 text-green-400 text-sm font-semibold">
                        <CheckCircle2 size={16} />
                        Fetched {scrapedData.rawCount} reviews from <strong>{scrapedData.businessName}</strong>
                        {scrapedData.isMock && <span className="text-xs text-amber-400 font-normal">(mock)</span>}
                    </div>
                    <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                        {scrapedData.reviews.slice(0, 4).map((r, i) => (
                            <p key={i} className="text-xs text-gray-400 border-l-2 border-white/10 pl-3 leading-relaxed">
                                "{r.length > 120 ? r.slice(0, 120) + '…' : r}"
                            </p>
                        ))}
                        {scrapedData.reviews.length > 4 && (
                            <p className="text-xs text-gray-600 pl-3">+ {scrapedData.reviews.length - 4} more reviews loaded</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const StatCard = ({ icon, count, label, pct, color }) => (
    <div className={`rounded-xl bg-${color}-500/10 border border-${color}-500/20 p-4 flex items-center gap-4`}>
        <div className={`p-2.5 rounded-full bg-${color}-500/20`}>{icon}</div>
        <div>
            <div className={`text-3xl font-black text-${color}-400`}>{count}</div>
            <div className="text-xs text-gray-400 mt-0.5">{label}</div>
        </div>
        <div className={`ml-auto text-2xl font-bold text-${color}-400/70`}>{pct}%</div>
    </div>
);

const SidebarItem = ({ icon, label, active = false }) => (
    <button className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition ${active ? 'bg-review-purple text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
        {icon}
        <span className="font-medium">{label}</span>
    </button>
);

const ResultCard = ({ title, icon, items, bgColor }) => (
    <div className={`glass-morphism rounded-2xl p-6 ${bgColor}`}>
        <div className="flex items-center space-x-2 mb-4">
            {icon}
            <h3 className="font-bold">{title}</h3>
        </div>
        <ul className="space-y-3">
            {items?.map((item, idx) => (
                <li key={idx} className="text-sm text-gray-300 flex items-start space-x-2">
                    <span className="text-review-purple mt-0.5">•</span>
                    <span>{item}</span>
                </li>
            ))}
        </ul>
    </div>
);

const ACCENT = {
    orange: { dot: 'bg-orange-500', num: 'text-orange-400', border: 'border-orange-500/20', bg: 'bg-orange-500/5' },
    teal:   { dot: 'bg-teal-500',   num: 'text-teal-400',   border: 'border-teal-500/20',   bg: 'bg-teal-500/5'   },
};

const NumberedCard = ({ title, subtitle, icon, items, accentColor }) => {
    const a = ACCENT[accentColor] || ACCENT.orange;
    return (
        <div className={`glass-morphism rounded-2xl p-6 border ${a.border} ${a.bg}`}>
            <div className="flex items-center gap-2 mb-1">
                {icon}
                <h3 className="font-bold">{title}</h3>
            </div>
            <p className="text-xs text-gray-500 mb-5 pl-7">{subtitle}</p>
            <ol className="space-y-3">
                {items?.slice(0, 5).map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                        <span className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${a.dot} text-white mt-0.5`}>
                            {idx + 1}
                        </span>
                        <span className="text-sm text-gray-300 leading-relaxed">{item}</span>
                    </li>
                ))}
            </ol>
        </div>
    );
};

const PaywallModal = ({ onClose, onUpgrade }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-lg glass-morphism rounded-3xl overflow-hidden border-purple-500/30 shadow-[0_0_40px_-10px_rgba(147,51,234,0.3)] animate-in slide-in-from-bottom-4 duration-500">
                
                {/* Header Graphic */}
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-purple-600/40 via-fuchsia-600/20 to-transparent pointer-events-none" />
                
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition z-10"
                >
                    <X size={20} />
                </button>

                <div className="p-8 pb-10">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/30 mb-6">
                        <Lock className="text-white" size={28} />
                    </div>

                    <h2 className="text-3xl font-bold mb-3">You've hit your limit!</h2>
                    <p className="text-gray-400 mb-8 text-lg">
                        You've used your free review analyses. Upgrade to <span className="text-review-purple font-semibold">ReviewX Pro</span> to unlock unlimited AI insights.
                    </p>

                    <div className="space-y-4 mb-8">
                        {[
                            { icon: <Zap size={18} className="text-amber-400" />, text: 'Unlimited review analyses & web scraping' },
                            { icon: <Star size={18} className="text-yellow-400" />, text: 'Access to "Top 5 to Change" & "Maintain" insights' },
                            { icon: <TrendingUp size={18} className="text-green-400" />, text: 'Priority AI processing queue' },
                        ].map((feature, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                                    {feature.icon}
                                </div>
                                <span className="text-sm font-medium text-gray-200">{feature.text}</span>
                            </div>
                        ))}
                    </div>

                    <div className="bg-purple-900/20 border border-purple-500/20 rounded-2xl p-5 mb-8 flex items-center justify-between">
                        <div>
                            <div className="text-sm text-purple-300 mb-1">Pro Plan</div>
                            <div className="text-2xl font-bold flex items-baseline gap-1">
                                $29<span className="text-sm text-gray-400 font-normal">/month</span>
                            </div>
                        </div>
                        <CreditCard size={32} className="text-purple-400 opacity-50" />
                    </div>

                    <button 
                        onClick={onUpgrade}
                        className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl font-bold text-lg hover:from-purple-500 hover:to-indigo-500 transition shadow-[0_0_20px_rgba(147,51,234,0.4)] flex items-center justify-center gap-2"
                    >
                        <Sparkles size={20} />
                        Upgrade to Pro Now
                    </button>
                    <p className="text-center text-xs text-gray-500 mt-4">
                        *Mock mode — clicking this will instantly unlock pro locally.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
