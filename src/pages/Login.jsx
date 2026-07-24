import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        // Mock login
        localStorage.setItem('isAuthenticated', 'true');
        navigate('/dashboard');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-review-dark">
            <div className="glass-morphism p-10 rounded-3xl w-full max-w-md">
                <Link to="/" className="text-2xl font-bold mb-8 block text-center bg-gradient-to-r from-review-purple to-indigo-400 bg-clip-text text-transparent">
                    ReviewX
                </Link>
                <h2 className="text-3xl font-bold mb-6 text-center">Welcome Back</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-gray-400 mb-2">Email Address</label>
                        <input
                            type="email"
                            className="w-full bg-white/5 border border-white/10 p-3 rounded-lg focus:border-review-purple outline-none"
                            placeholder="name@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-400 mb-2">Password</label>
                        <input
                            type="password"
                            className="w-full bg-white/5 border border-white/10 p-3 rounded-lg focus:border-review-purple outline-none"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button className="w-full py-3 bg-review-purple rounded-lg font-bold hover:bg-purple-700 transition">
                        Sign In
                    </button>
                </form>
                <p className="mt-8 text-center text-gray-500">
                    Don't have an account? <Link to="/signup" className="text-review-purple hover:underline">Sign up</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
