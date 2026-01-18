'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/api';
import FunBackground from '@/components/FunBackground';

export default function HostLogin() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username.trim() || !password.trim()) {
            setError('Please enter username and password');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await auth.login(username, password);
            router.push('/host');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4">
            {/* Background with floating objects */}
            <FunBackground />

            {/* Back Link */}
            <div className="fixed top-6 left-6 z-20">
                <a href="/" className="btn btn-secondary text-sm font-bold rotate-2 hover:-rotate-1">
                    ← Back to Party
                </a>
            </div>

            {/* Hero Section */}
            <div className="text-center mb-12 animate-fade-in relative z-10">
                <h1 className="text-6xl font-black mb-6 hover:scale-105 transition-transform duration-300 transform -rotate-2">
                    <span className="text-party-gradient drop-shadow-sm">HOST PORTAL</span>
                </h1>
                <p className="text-xl font-bold text-[var(--text-muted)] max-w-lg mx-auto bg-white/80 p-4 rounded-xl border-2 border-dashed border-[var(--border-color)] rotate-1">
                    👑 Create epic surveys & manage the fun!
                </p>
            </div>

            {/* Login Card */}
            <div className="card-party w-full max-w-md animate-slide-up">
                <div className="absolute -top-6 -right-6 text-4xl animate-wiggle transform rotate-12">🔐</div>

                <h2 className="text-3xl font-black mb-8 text-center text-[var(--color-purple)] uppercase tracking-wide">
                    Welcome Back!
                </h2>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                        <label className="input-label">👤 Username</label>
                        <input
                            type="text"
                            className="input-party"
                            placeholder="admin"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            autoComplete="username"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="input-label">🔑 Password</label>
                        <input
                            type="password"
                            className="input-party"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="current-password"
                        />
                    </div>

                    {error && (
                        <div className="p-3 font-bold rounded-lg text-center animate-fade-in border-2 border-[var(--color-pink)] shadow-[4px_4px_0px_#000]"
                            style={{ color: 'var(--text-dark)', backgroundColor: 'white' }}>
                            🚨 {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary w-full text-xl py-5 hover:scale-105"
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <div className="spinner border-white" style={{ width: 20, height: 20 }} />
                                Signing in...
                            </span>
                        ) : (
                            '🚀 LET\'S GO!'
                        )}
                    </button>
                </form>
            </div>

            {/* Fun Footer */}
            <div className="mt-12 animate-fade-in relative z-10" style={{ animationDelay: '0.3s' }}>
                <p className="text-sm font-bold text-[var(--text-muted)] bg-white/60 px-6 py-3 rounded-full border-2 border-[var(--border-color)] transform -rotate-2">
                    ✨ Ready to make some magic? ✨
                </p>
            </div>
        </div>
    );
}
