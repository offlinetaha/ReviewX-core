import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, MessageSquare, Zap } from 'lucide-react';

const LandingPage = () => {
    return (
        <div className="bg-review-dark text-white min-h-screen">
            {/* Navbar */}
            <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto backdrop-blur-md sticky top-0 z-50">
                <div className="text-2xl font-bold bg-gradient-to-r from-review-purple to-indigo-400 bg-clip-text text-transparent">
                    ReviewX
                </div>
                <div className="space-x-4">
                    <Link to="/login" className="px-6 py-2 rounded-lg hover:bg-white/5 transition">Login</Link>
                    <Link to="/signup" className="px-6 py-2 bg-review-purple rounded-lg hover:bg-purple-700 transition font-medium">Get Started</Link>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="max-w-7xl mx-auto px-6 pt-20 pb-32 text-center">
                <h1 className="text-6xl font-extrabold mb-6 leading-tight">
                    Turn Customer Reviews into <br />
                    <span className="bg-gradient-to-r from-review-purple to-indigo-400 bg-clip-text text-transparent">Business Growth</span>
                </h1>
                <p className="text-gray-400 text-xl max-w-2xl mx-auto mb-10">
                    ReviewX uses AI to analyze your reviews in bulk, surfacing actionable insights and helping you save hours of manual reading.
                </p>
                <Link to="/signup" className="px-8 py-4 bg-review-purple rounded-full text-lg font-bold hover:scale-105 transition transform inline-flex items-center group">
                    Start Analyzing Now <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
            </header>

            {/* Features */}
            <section className="bg-review-navy/30 py-24">
                <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-12">
                    <FeatureCard
                        icon={<MessageSquare className="text-review-purple" size={32} />}
                        title="Bulk Ingestion"
                        description="Paste reviews from Google, Yelp, or Amazon instantly."
                    />
                    <FeatureCard
                        icon={<Zap className="text-review-purple" size={32} />}
                        title="AI Analysis"
                        description="Powered by GPT-4o to find complaints, praises, and action items."
                    />
                    <FeatureCard
                        icon={<BarChart3 className="text-review-purple" size={32} />}
                        title="Sentiment Tracking"
                        description="Visualize overall sentiment and business performance over time."
                    />
                </div>
            </section>

            {/* How it works */}
            <section className="max-w-7xl mx-auto px-6 py-24">
                <h2 className="text-4xl font-bold text-center mb-16">How ReviewX Works</h2>
                <div className="grid md:grid-cols-3 gap-8">
                    <Step num="1" title="Paste Reviews" text="Copy-paste your customer feedback from any platform." />
                    <Step num="2" title="AI Magic" text="Our AI analyzes sentiment and identifies key themes." />
                    <Step num="3" title="Grow Business" text="Implement changes based on data-driven insights." />
                </div>
            </section>

            <footer className="border-t border-white/5 py-12 text-center text-gray-500">
                <p>© 2026 ReviewX. All rights reserved.</p>
            </footer>
        </div>
    );
};

const FeatureCard = ({ icon, title, description }) => (
    <div className="glass-morphism p-8 rounded-2xl hover:border-review-purple/50 transition">
        <div className="mb-4">{icon}</div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-gray-400">{description}</p>
    </div>
);

const Step = ({ num, title, text }) => (
    <div className="text-center">
        <div className="w-12 h-12 bg-review-purple rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-4">{num}</div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-gray-400">{text}</p>
    </div>
);

export default LandingPage;
