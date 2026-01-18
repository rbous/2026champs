'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { rooms } from '@/lib/api';
import FunBackground from '@/components/FunBackground';

export default function Home() {
  const router = useRouter();
  const [roomCode, setRoomCode] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Auto-rejoin check
    const storedToken = localStorage.getItem('player_token');
    const storedCode = localStorage.getItem('room_code');
    if (storedToken && storedCode) {
      // We could verify token validity here, but for now just redirect
      router.push(`/play/${storedCode}`);
    }
  }, [router]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCode.trim() || !nickname.trim()) {
      setError('Please enter both room code and nickname');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await rooms.join(roomCode.toUpperCase(), nickname);
      router.push(`/play/${roomCode.toUpperCase()}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      {/* Background with floating objects */}
      <FunBackground />

      {/* Hero Section */}
      <div className="text-center mb-12 animate-fade-in relative z-10">
        <h1 className="text-6xl font-black mb-6 hover:scale-105 transition-transform duration-300 transform -rotate-2">
          <span className="text-party-gradient drop-shadow-sm">CHAMP-ANZEE</span>
        </h1>
        <p className="text-xl font-bold text-[var(--text-muted)] max-w-lg mx-auto bg-white/80 p-4 rounded-xl border-2 border-dashed border-[var(--border-color)] rotate-1">
          🎉 The most fun way to survey!
        </p>
      </div>

      {/* Join Room Card */}
      <div className="card-party w-full max-w-md animate-slide-up">
        <div className="absolute -top-6 -right-6 text-4xl animate-wiggle transform rotate-12">🎫</div>

        <h2 className="text-3xl font-black mb-8 text-center text-[var(--color-purple)] uppercase tracking-wide">
          Join the Party!
        </h2>

        <form onSubmit={handleJoin} className="space-y-6">
          <div className="space-y-2">
            <label className="input-label">Room Code</label>
            <input
              type="text"
              className="input-party text-center text-3xl font-black tracking-[0.2em] uppercase text-[var(--color-pink)]"
              placeholder="ABC1234"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              maxLength={8}
              autoComplete="off"
            />
          </div>

          <div className="space-y-2">
            <label className="input-label">Nickname</label>
            <input
              type="text"
              className="input-party"
              placeholder="What should we call you?"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={20}
              autoComplete="off"
            />
          </div>

          {error && (
            <div className="p-3 bg-[var(--color-pink)] text-white font-bold rounded-lg text-center animate-fade-in border-2 border-[var(--border-color)] shadow-[4px_4px_0px_#000]">
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
                Joining...
              </span>
            ) : (
              '🚀 LET\'S GO!'
            )}
          </button>
        </form>
      </div>

      {/* Host Link */}
      <div className="mt-12 animate-fade-in relative z-10" style={{ animationDelay: '0.3s' }}>
        <a
          href="/host/login"
          className="btn btn-secondary text-sm font-bold rotate-2 hover:-rotate-1"
        >
          👑 Host a Party
        </a>
      </div>
    </div>
  );
}
