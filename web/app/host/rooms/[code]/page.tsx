'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { rooms, getHostWebSocketUrl, type LeaderboardEntry } from '@/lib/api';
import { useHostWebSocket, type PlayerJoinedEvent, type PlayerLeftEvent, type LeaderboardUpdateEvent, type PlayerProgressEvent, type RoomEndedEvent } from '@/hooks/useWebSocket';
import LobbyBackground from '@/components/LobbyBackground';
import GameBackground from '@/components/GameBackground';

interface Player {
    id: string;
    nickname: string;
    status: 'joined' | 'answering' | 'done';
    currentQuestion?: string;
}

export default function RoomDashboard() {
    const params = useParams();
    const router = useRouter();
    const code = params.code as string;

    const [roomStatus, setRoomStatus] = useState<'waiting' | 'active' | 'ended'>('waiting');
    const [players, setPlayers] = useState<Map<string, Player>>(new Map());
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [wsUrl, setWsUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // WebSocket handlers
    const handlePlayerJoined = useCallback((event: PlayerJoinedEvent) => {
        setPlayers(prev => {
            const updated = new Map(prev);
            updated.set(event.playerId, {
                id: event.playerId,
                nickname: event.nickname,
                status: 'joined',
            });
            return updated;
        });
    }, []);

    const handlePlayerLeft = useCallback((event: PlayerLeftEvent) => {
        setPlayers(prev => {
            const updated = new Map(prev);
            updated.delete(event.playerId);
            return updated;
        });
    }, []);

    const handleLeaderboardUpdate = useCallback((event: LeaderboardUpdateEvent) => {
        setLeaderboard(event.leaderboard);
    }, []);

    const handlePlayerProgress = useCallback((event: PlayerProgressEvent) => {
        setPlayers(prev => {
            const updated = new Map(prev);
            const player = updated.get(event.playerId);
            if (player) {
                updated.set(event.playerId, {
                    ...player,
                    status: 'answering',
                    currentQuestion: event.questionKey,
                });
            }
            return updated;
        });
    }, []);

    const { status: wsStatus } = useHostWebSocket(wsUrl, {
        onPlayerJoined: handlePlayerJoined,
        onPlayerLeft: handlePlayerLeft,
        onLeaderboardUpdate: handleLeaderboardUpdate,
        onPlayerProgress: handlePlayerProgress,
        onRoomEnded: (event: RoomEndedEvent) => {
            console.log("Room ended via WebSocket:", event);
            setRoomStatus('ended');
        },
    });

    useEffect(() => {
        // Set up WebSocket connection
        const url = getHostWebSocketUrl(code);
        setWsUrl(url);
    }, [code]);

    const handleStartRoom = async () => {
        setLoading(true);
        try {
            await rooms.start(code);
            setRoomStatus('active');
        } catch (err) {
            console.error('Failed to start room:', err);
            alert('Failed to start room');
        } finally {
            setLoading(false);
        }
    };

    const handleEndRoom = async () => {
        if (!confirm('Are you sure you want to end this room?')) return;

        setLoading(true);
        try {
            await rooms.end(code);
            setRoomStatus('ended');
            router.push(`/host/reports/${code}`);
        } catch (err) {
            console.error('Failed to end room:', err);
            alert('Failed to end room');
        } finally {
            setLoading(false);
        }
    };

    const copyJoinLink = () => {
        const link = `${window.location.origin}/?code=${code}`;
        navigator.clipboard.writeText(link);
    };

    const playerList = Array.from(players.values());

    return (
        <div className="min-h-screen p-6 relative">
            {/* Backgrounds */}
            {roomStatus === 'waiting' && <LobbyBackground />}
            {roomStatus === 'active' && <GameBackground />}

            {/* Content */}
            <div className="relative z-10 max-w-6xl mx-auto">
                <header className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <a href="/host" className="btn btn-ghost">← Back</a>
                        <div>
                            <h1 className="text-xl font-bold">Room Dashboard</h1>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`w-3 h-3 rounded-full border-2 border-black ${wsStatus === 'connected' ? 'bg-[var(--color-green)]' :
                                    wsStatus === 'connecting' ? 'bg-[var(--color-yellow)] animate-pulse' :
                                        'bg-[var(--color-pink)]'
                                    }`} />
                                <span className="text-sm font-bold text-[var(--text-muted)]">
                                    {wsStatus === 'connected' ? 'Live & Ready' : wsStatus}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {roomStatus === 'waiting' && (
                            <button
                                onClick={handleStartRoom}
                                disabled={loading || playerList.length === 0}
                                className="btn btn-green hover:scale-105"
                            >
                                {loading ? 'Starting...' : '▶ Start Party'}
                            </button>
                        )}
                        {roomStatus === 'active' && (
                            <button
                                onClick={handleEndRoom}
                                disabled={loading}
                                className="btn btn-primary hover:scale-105"
                            >
                                {loading ? 'Ending...' : '⏹ End Party'}
                            </button>
                        )}
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Room Code Display */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="card-party text-center py-8">
                            <p className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2">Room Code</p>
                            <div className="text-6xl font-black text-party-gradient tracking-widest mb-6 drop-shadow-sm">{code}</div>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <button onClick={copyJoinLink} className="btn btn-secondary">
                                    📋 Copy Link
                                </button>
                                <span className="badge-party" style={{ borderColor: 'var(--color-blue)' }}>
                                    {playerList.length} player{playerList.length !== 1 ? 's' : ''} joined
                                </span>
                            </div>
                        </div>

                        {/* Leaderboard */}
                        <div className="card-party">
                            <h2 className="text-2xl font-black mb-6">🏆 Leaderboard</h2>
                            {leaderboard.length === 0 ? (
                                <div className="text-center py-12 border-2 border-dashed border-[var(--border-color)] rounded-xl bg-[var(--bg-cream)]">
                                    <p className="text-lg font-bold text-[var(--text-muted)]">
                                        {roomStatus === 'waiting'
                                            ? 'Start the party to see scores!'
                                            : 'Waiting for the first answers...'}
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {leaderboard.map((entry, i) => (
                                        <div key={entry.playerId} className="flex items-center gap-4 p-4 bg-[var(--bg-cream)] border-2 border-[var(--border-color)] rounded-xl transform hover:-translate-y-1 transition-transform">
                                            <div className={`w-10 h-10 flex items-center justify-center font-black rounded-full border-2 border-black ${i === 0 ? 'bg-[var(--color-yellow)] text-xl' :
                                                i === 1 ? 'bg-[#E2E8F0] text-lg' :
                                                    i === 2 ? 'bg-[#ED8936] text-lg' : 'bg-white'
                                                }`}>
                                                {entry.rank}
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-bold text-lg">{entry.nickname}</div>
                                            </div>
                                            <div className="text-2xl font-black text-[var(--color-purple)]">
                                                {entry.score}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Players Sidebar */}
                    <div className="card-party h-fit">
                        <h2 className="text-2xl font-black mb-6">👥 VIP List</h2>
                        {playerList.length === 0 ? (
                            <div className="text-center py-12 text-[var(--text-muted)]">
                                <div className="text-4xl mb-2 animate-bounce-slow">🎟️</div>
                                <p className="font-bold">Waiting for VIPs...</p>
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                                {playerList.map((player) => (
                                    <div
                                        key={player.id}
                                        className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-cream)] border-2 border-[var(--border-color)]"
                                    >
                                        <div className="w-10 h-10 rounded-full border-2 border-[var(--color-blue)] flex items-center justify-center font-black text-[var(--color-blue)] bg-white">
                                            {(player.nickname || '?').charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-bold truncate">{player.nickname}</div>
                                            {player.currentQuestion && (
                                                <div className="text-xs font-bold text-[var(--text-muted)]">
                                                    On {player.currentQuestion}
                                                </div>
                                            )}
                                        </div>
                                        <span className={`badge-party ${player.status === 'answering' ? 'animate-pulse' : ''}`}
                                            style={{
                                                borderColor: player.status === 'joined' ? undefined :
                                                    player.status === 'answering' ? 'var(--color-yellow)' : 'var(--color-green)'
                                            }}
                                        >
                                            {player.status === 'joined' ? 'Ready' :
                                                player.status === 'answering' ? 'Busy...' : 'Done'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
