'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { reports, type RoomSnapshot, type AIReport } from '@/lib/api';
import GameBackground from '@/components/GameBackground';

type Tab = 'snapshot' | 'ai';

export default function ReportsPage() {
    const params = useParams();
    const code = params.code as string;

    const [activeTab, setActiveTab] = useState<Tab>('snapshot');
    const [snapshot, setSnapshot] = useState<RoomSnapshot | null>(null);
    const [aiReport, setAiReport] = useState<AIReport | null>(null);
    const [loadingSnapshot, setLoadingSnapshot] = useState(true);
    const [loadingAI, setLoadingAI] = useState(false);
    const [pollingAI, setPollingAI] = useState(false);

    useEffect(() => {
        loadSnapshot();
    }, [code]);

    const loadSnapshot = async () => {
        try {
            const data = await reports.getSnapshot(code);
            setSnapshot(data);
        } catch (err) {
            console.error('Failed to load snapshot:', err);
        } finally {
            setLoadingSnapshot(false);
        }
    };

    const triggerAIReport = async () => {
        setLoadingAI(true);
        try {
            await reports.triggerAIReport(code);
            setPollingAI(true);
            pollAIReport();
        } catch (err) {
            console.error('Failed to trigger AI report:', err);
        } finally {
            setLoadingAI(false);
        }
    };

    const pollAIReport = async () => {
        try {
            const data = await reports.getAIReport(code);
            setAiReport(data);

            if (data.status === 'pending') {
                setTimeout(pollAIReport, 3000);
            } else {
                setPollingAI(false);
            }
        } catch (err) {
            console.error('Failed to get AI report:', err);
            setPollingAI(false);
        }
    };

    return (
        <div className="min-h-screen p-6 relative">
            <GameBackground />

            <div className="relative z-10 max-w-6xl mx-auto">
                {/* Header */}
                <header className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <a href="/host" className="btn btn-secondary rotate-1 hover:-rotate-1">
                            ← Dashboard
                        </a>
                        <div>
                            <h1 className="text-3xl font-black">
                                <span className="text-party-gradient">📊 Room Report</span>
                            </h1>
                            <p className="text-[var(--text-muted)] font-bold">
                                Room: <span className="font-mono text-[var(--color-purple)]">{code}</span>
                            </p>
                        </div>
                    </div>
                </header>

                {/* Tabs */}
                <div className="flex gap-3 mb-8">
                    <button
                        onClick={() => setActiveTab('snapshot')}
                        className={`btn ${activeTab === 'snapshot' ? 'btn-primary' : 'btn-secondary'} hover:scale-105`}
                    >
                        📊 Snapshot
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab('ai');
                            if (!aiReport) triggerAIReport();
                        }}
                        className={`btn ${activeTab === 'ai' ? 'btn-primary' : 'btn-secondary'} hover:scale-105`}
                    >
                        🤖 AI Insights
                    </button>
                </div>

                {/* Snapshot Tab */}
                {activeTab === 'snapshot' && (
                    <div className="space-y-6 animate-fade-in">
                        {loadingSnapshot ? (
                            <div className="card-party flex items-center justify-center py-16">
                                <div className="text-center">
                                    <div className="spinner mx-auto mb-4" style={{ width: 40, height: 40 }} />
                                    <p className="font-bold text-[var(--text-muted)]">Loading data...</p>
                                </div>
                            </div>
                        ) : snapshot ? (
                            <>
                                {/* Overview Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="card-party text-center py-8 animate-pop-in">
                                        <div className="text-5xl font-black text-party-gradient mb-2">
                                            {Math.round((snapshot.completionRate || 0) * 100)}%
                                        </div>
                                        <div className="text-lg font-bold text-[var(--text-muted)]">Completion Rate</div>
                                    </div>
                                    <div className="card-party text-center py-8 animate-pop-in" style={{ animationDelay: '0.1s' }}>
                                        <div className="text-5xl font-black text-[var(--color-blue)] mb-2">
                                            {snapshot.leaderboard?.length || 0}
                                        </div>
                                        <div className="text-lg font-bold text-[var(--text-muted)]">Total Players</div>
                                    </div>
                                    <div className="card-party text-center py-8 animate-pop-in" style={{ animationDelay: '0.2s' }}>
                                        <div className="text-5xl font-black text-[var(--color-yellow)] mb-2">
                                            {Math.round((snapshot.skipRate || 0) * 100)}%
                                        </div>
                                        <div className="text-lg font-bold text-[var(--text-muted)]">Skip Rate</div>
                                    </div>
                                </div>

                                {/* Leaderboard */}
                                <div className="card-party">
                                    <h2 className="text-2xl font-black mb-6">🏆 Final Leaderboard</h2>
                                    {snapshot.leaderboard?.length > 0 ? (
                                        <div className="space-y-3">
                                            {snapshot.leaderboard.slice(0, 10).map((entry, i) => (
                                                <div key={entry.playerId || `entry-${i}`} className="flex items-center gap-4 p-4 bg-[var(--bg-cream)] border-2 border-[var(--border-color)] rounded-xl transform hover:-translate-y-1 transition-transform">
                                                    <div className={`w-12 h-12 flex items-center justify-center font-black text-xl rounded-full border-2 border-black ${i === 0 ? 'bg-[var(--color-yellow)]' :
                                                        i === 1 ? 'bg-[#E2E8F0]' :
                                                            i === 2 ? 'bg-[#ED8936]' : 'bg-white'
                                                        }`}>
                                                        {entry.rank}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="font-bold text-lg">{entry.nickname}</div>
                                                    </div>
                                                    <div className="text-3xl font-black text-[var(--color-purple)]">
                                                        {entry.score}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-[var(--text-muted)] text-center py-8 font-bold">No players</p>
                                    )}
                                </div>

                                {/* Per-Question Breakdown */}
                                <div className="card-party">
                                    <h2 className="text-2xl font-black mb-6">❓ Question Breakdown</h2>
                                    <div className="space-y-6">
                                        {snapshot.questionProfiles?.map((q, i) => (
                                            <div key={q.key || `question-${i}`} className="p-6 rounded-xl bg-[var(--bg-cream)] border-2 border-[var(--border-color)]">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <span className="badge-party" style={{ borderColor: 'var(--color-blue)' }}>{q.key}</span>
                                                    <span className="badge-party" style={{ borderColor: 'var(--color-yellow)' }}>{q.type}</span>
                                                </div>
                                                <p className="text-lg font-bold mb-4">{q.prompt}</p>

                                                {/* Stats */}
                                                <div className="grid grid-cols-2 gap-4 mb-4">
                                                    <div className="text-center p-3 bg-white rounded-lg border-2 border-[var(--border-color)]">
                                                        <div className="text-2xl font-black text-[var(--color-blue)]">{q.answerCount}</div>
                                                        <div className="text-xs font-bold text-[var(--text-muted)]">Total Answers</div>
                                                    </div>
                                                    <div className="text-center p-3 bg-white rounded-lg border-2 border-[var(--border-color)]">
                                                        <div className="text-2xl font-black text-[var(--color-purple)]">{q.ratingCount}</div>
                                                        <div className="text-xs font-bold text-[var(--text-muted)]">Ratings</div>
                                                    </div>
                                                </div>

                                                {/* Rating histogram */}
                                                {q.ratingHist && q.ratingHist.length > 0 && (
                                                    <div className="mb-4 p-4 bg-white rounded-lg border-2 border-[var(--border-color)]">
                                                        <div className="text-sm font-bold text-[var(--text-muted)] mb-3">Rating Distribution</div>
                                                        <div className="flex items-end gap-2 h-20">
                                                            {q.ratingHist.map((count, i) => {
                                                                const max = Math.max(...q.ratingHist!);
                                                                const height = max > 0 ? (count / max) * 100 : 0;
                                                                return (
                                                                    <div key={i} className="flex-1 flex flex-col items-center">
                                                                        <div
                                                                            className="w-full bg-[var(--color-purple)] rounded-t"
                                                                            style={{ height: `${height}%`, minHeight: count > 0 ? 8 : 0 }}
                                                                        />
                                                                        <span className="text-sm font-bold mt-2 text-[var(--text-muted)]">{i + 1}</span>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                        {q.mean && (
                                                            <div className="text-sm font-bold text-[var(--text-muted)] mt-3">
                                                                Mean: {q.mean.toFixed(1)} | Median: {q.median?.toFixed(1)}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Themes */}
                                                {q.topThemes?.length > 0 && (
                                                    <div className="mb-3">
                                                        <div className="text-sm font-bold text-[var(--text-muted)] mb-2">Top Themes</div>
                                                        <div className="flex flex-wrap gap-2">
                                                            {q.topThemes.map((theme, i) => (
                                                                <span key={i} className="badge-party" style={{ borderColor: 'var(--color-green)' }}>{theme}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Misunderstandings */}
                                                {q.misunderstandings?.length > 0 && (
                                                    <div>
                                                        <div className="text-sm font-bold text-[var(--text-muted)] mb-2">Common Misunderstandings</div>
                                                        <ul className="space-y-1">
                                                            {q.misunderstandings.map((m, i) => (
                                                                <li key={i} className="text-[var(--color-pink)] font-bold">• {m}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Room Summary */}
                                {snapshot.roomSummary && (
                                    <div className="card-party">
                                        <h2 className="text-2xl font-black mb-6">📋 Room Summary</h2>

                                        {snapshot.roomSummary.topThemes?.length > 0 && (
                                            <div className="mb-6">
                                                <div className="text-lg font-bold text-[var(--text-muted)] mb-3">Top Themes</div>
                                                <div className="flex flex-wrap gap-2">
                                                    {snapshot.roomSummary.topThemes.map((theme, i) => (
                                                        <span key={i} className="badge-party text-lg px-4 py-2" style={{ borderColor: 'var(--color-purple)' }}>{theme}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {snapshot.roomSummary.contrasts?.length > 0 && (
                                            <div className="mb-6">
                                                <div className="text-lg font-bold text-[var(--text-muted)] mb-3">Key Contrasts</div>
                                                <div className="space-y-3">
                                                    {snapshot.roomSummary.contrasts.map((c, i) => (
                                                        <div key={i} className="p-4 rounded-xl bg-[var(--bg-cream)] border-2 border-[var(--border-color)]">
                                                            <div className="font-black text-lg mb-2">{c.axis}</div>
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div className="p-3 rounded-lg bg-[var(--color-green)] text-white font-bold text-center">{c.sideA}</div>
                                                                <div className="p-3 rounded-lg bg-[var(--color-pink)] text-white font-bold text-center">{c.sideB}</div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {snapshot.roomSummary.frictionPoints?.length > 0 && (
                                            <div>
                                                <div className="text-lg font-bold text-[var(--text-muted)] mb-3">Friction Points</div>
                                                <ul className="space-y-2">
                                                    {snapshot.roomSummary.frictionPoints.map((f, i) => (
                                                        <li key={i} className="text-[var(--color-pink)] font-bold text-lg">⚠️ {f}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="card-party text-center py-16">
                                <div className="text-6xl mb-4">📭</div>
                                <p className="text-xl font-bold text-[var(--text-muted)]">No snapshot data available</p>
                            </div>
                        )}
                    </div>
                )}

                {/* AI Report Tab */}
                {activeTab === 'ai' && (
                    <div className="animate-fade-in">
                        {loadingAI || pollingAI ? (
                            <div className="card-party text-center py-16">
                                <div className="spinner mx-auto mb-4" style={{ width: 48, height: 48 }} />
                                <p className="text-xl font-bold text-[var(--color-purple)]">
                                    {loadingAI ? 'Triggering AI analysis...' : '🧠 AI Brain is thinking...'}
                                </p>
                                <p className="text-sm font-bold text-[var(--text-muted)] mt-2">This may take a moment</p>
                            </div>
                        ) : aiReport?.status === 'ready' ? (
                            <div className="space-y-6">
                                {/* Executive Summary */}
                                {aiReport.executiveSummary && (
                                    <div className="card-party">
                                        <h2 className="text-2xl font-black mb-6">📋 Executive Summary</h2>
                                        <ul className="space-y-3">
                                            {aiReport.executiveSummary.map((point, i) => (
                                                <li key={i} className="flex gap-3 text-lg">
                                                    <span className="text-[var(--color-pink)] font-black">•</span>
                                                    <span className="font-bold">{point}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Key Themes */}
                                {aiReport.keyThemes && aiReport.keyThemes.length > 0 && (
                                    <div className="card-party">
                                        <h2 className="text-2xl font-black mb-6">🎯 Key Themes</h2>
                                        <div className="space-y-4">
                                            {aiReport.keyThemes.map((theme, i) => (
                                                <div key={i} className="p-5 rounded-xl bg-[var(--bg-cream)] border-2 border-[var(--border-color)]">
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <span className="badge-party text-lg px-4 py-2" style={{ borderColor: 'var(--color-purple)' }}>{theme.name}</span>
                                                        <span className="text-lg font-bold text-[var(--text-muted)]">
                                                            {theme.percentage}% of responses
                                                        </span>
                                                    </div>
                                                    <p className="text-lg font-bold mb-3">{theme.meaning}</p>
                                                    {theme.evidence && (
                                                        <div className="text-sm font-bold text-[var(--text-muted)]">
                                                            Evidence: {theme.evidence.join('; ')}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Contrasts */}
                                {aiReport.contrasts && aiReport.contrasts.length > 0 && (
                                    <div className="card-party">
                                        <h2 className="text-2xl font-black mb-6">⚖️ Key Contrasts</h2>
                                        <div className="space-y-4">
                                            {aiReport.contrasts.map((c, i) => (
                                                <div key={i} className="p-5 rounded-xl bg-[var(--bg-cream)] border-2 border-[var(--border-color)]">
                                                    <div className="font-black text-lg mb-3">{c.axis}</div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="p-4 rounded-lg bg-[var(--color-green)] text-white font-bold text-center">{c.sideA}</div>
                                                        <div className="p-4 rounded-lg bg-[var(--color-pink)] text-white font-bold text-center">{c.sideB}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Recommendations */}
                                {aiReport.recommendedNextQuestions && aiReport.recommendedNextQuestions.length > 0 && (
                                    <div className="card-party">
                                        <h2 className="text-2xl font-black mb-6">💡 Recommended Next Questions</h2>
                                        <ul className="space-y-3">
                                            {aiReport.recommendedNextQuestions.map((q, i) => (
                                                <li key={i} className="p-4 rounded-xl bg-[var(--bg-cream)] border-2 border-[var(--border-color)] font-bold text-lg">
                                                    {q}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Recommended Edits */}
                                {aiReport.recommendedEdits && aiReport.recommendedEdits.length > 0 && (
                                    <div className="card-party">
                                        <h2 className="text-2xl font-black mb-6">✏️ Suggested Question Edits</h2>
                                        <div className="space-y-4">
                                            {aiReport.recommendedEdits.map((edit, i) => (
                                                <div key={i} className="p-5 rounded-xl bg-[var(--bg-cream)] border-2 border-[var(--border-color)]">
                                                    <span className="badge-party mb-3" style={{ borderColor: 'var(--color-blue)' }}>{edit.questionKey}</span>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                                                        <div>
                                                            <div className="text-sm font-bold text-[var(--text-muted)] mb-2">Original</div>
                                                            <div className="text-lg p-3 rounded-lg bg-[var(--color-pink)] text-white font-bold">{edit.original}</div>
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-bold text-[var(--text-muted)] mb-2">Suggested</div>
                                                            <div className="text-lg p-3 rounded-lg bg-[var(--color-green)] text-white font-bold">{edit.suggested}</div>
                                                        </div>
                                                    </div>
                                                    <div className="text-sm font-bold text-[var(--text-muted)]">
                                                        Reason: {edit.reason}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : aiReport?.status === 'error' ? (
                            <div className="card-party text-center py-16">
                                <div className="text-6xl mb-4">❌</div>
                                <p className="text-xl font-bold text-[var(--color-pink)] mb-6">Failed to generate AI report</p>
                                <button onClick={triggerAIReport} className="btn btn-primary hover:scale-105">
                                    🔄 Retry
                                </button>
                            </div>
                        ) : (
                            <div className="card-party text-center py-16">
                                <div className="text-6xl mb-4 animate-bounce-slow">🤖</div>
                                <h3 className="text-2xl font-black mb-3">AI Insights</h3>
                                <p className="text-lg font-bold text-[var(--text-muted)] mb-6">
                                    Generate deep insights and recommendations
                                </p>
                                <button onClick={triggerAIReport} className="btn btn-primary text-xl py-4 px-8 hover:scale-105">
                                    ✨ Generate Report
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
