import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { matchApi } from '../api/client';
import { useSocket } from '../hooks/useSocket';
import type { Match, MatchEvent, MatchStats } from '../types';
import clsx from 'clsx';
import Timeline from '../components/Timeline';
import Statistics from '../components/Statistics';
import Chat from '../components/Chat';

const MatchDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [match, setMatch] = useState<Match | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'timeline' | 'stats' | 'chat'>('timeline');
    const { socket } = useSocket();

    // State for tabs data (will be passed to components)
    const [events, setEvents] = useState<MatchEvent[]>([]);
    const [stats, setStats] = useState<MatchStats | null>(null);

    useEffect(() => {
        if (!id) return;

        const fetchMatchData = async () => {
            try {
                const data = await matchApi.getMatchById(id);
                setMatch(data);
                // Simulate fetching initial events/stats if API supported it
                // For now, we rely on potential socket initial payload or separate endpoints if they existed
                // But per requirements, we just have /api/matches/:id. 
                // We might need to fetch events/stats separately if the API provides them, 
                // or maybe they are included in the match object? 
                // The instructions say "Match Dashboard ... Match Detail View ... Events ... Stats".
                // If the API doesn't provide them in getMatchById, we'll assume they arrive via socket or are empty initially.
                // Let's assume standard behavior where strict initial load might be minimal and we rely on updates or maybe mocks for now if API is limited.
            } catch (err) {
                console.error("Failed to fetch match:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchMatchData();
    }, [id]);

    useEffect(() => {
        if (!socket || !id) return;

        socket.emit('subscribe_match', id);

        const handleMatchUpdate = (data: Partial<Match>) => {
            setMatch(prev => prev ? { ...prev, ...data } : null);
        };

        const handleMatchEvent = (event: MatchEvent) => {
            if (event.matchId === id) {
                setEvents(prev => [...prev, event]);
            }
        };

        const handleStatsUpdate = (newStats: MatchStats & { matchId: string }) => {
            if (newStats.matchId === id) {
                setStats(newStats);
            }
        };

        socket.on('match_update', handleMatchUpdate); // assuming generic update
        socket.on('match_event', handleMatchEvent);
        socket.on('stats_update', handleStatsUpdate);

        return () => {
            socket.emit('unsubscribe_match', id);
            socket.off('match_update', handleMatchUpdate);
            socket.off('match_event', handleMatchEvent);
            socket.off('stats_update', handleStatsUpdate);
        };
    }, [socket, id]);

    if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-blue-600">Loading match details...</div>;
    if (!match) return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-red-500">Match not found</div>;

    const isLive = match.status === 'FIRST_HALF' || match.status === 'SECOND_HALF';

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
            {/* Navigation & Header */}
            <div className="relative bg-white border-b border-slate-200 pb-8 pt-6">
                <div className="container mx-auto px-4 max-w-4xl">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center text-slate-500 hover:text-slate-900 mb-6 transition-colors font-medium text-sm group"
                    >
                        <span className="mr-1 group-hover:-translate-x-1 transition-transform">&larr;</span> Back to Dashboard
                    </button>

                    {/* Scoreboard */}
                    <div className="flex flex-col md:flex-row justify-between items-center bg-white rounded-2xl p-8 border border-slate-200 relative overflow-hidden shadow-sm">
                        {/* Background Glow */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-blue-50/50 blur-3xl pointer-events-none"></div>

                        {/* Home Team */}
                        <div className="text-center w-full md:w-1/3 z-10">
                            <div className="w-20 h-20 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-2xl font-bold text-slate-700 mb-4 shadow-sm border border-slate-200">
                                {match.homeTeam.shortName.substring(0, 2).toUpperCase()}
                            </div>
                            <h2 className="text-2xl font-bold tracking-tight text-slate-900">{match.homeTeam.name}</h2>
                        </div>

                        {/* Score & Status */}
                        <div className="text-center w-full md:w-1/3 flex flex-col items-center my-6 md:my-0 z-10">
                            <div className={clsx(
                                "text-5xl font-black tracking-tight mb-2",
                                isLive ? "text-transparent bg-clip-text bg-gradient-to-b from-slate-900 to-slate-600" : "text-slate-900"
                            )}>
                                {match.score?.home ?? 0} - {match.score?.away ?? 0}
                            </div>
                            <div className={clsx(
                                "text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border",
                                isLive ? "bg-red-50 text-red-600 border-red-200 animate-pulse" : "bg-slate-100 text-slate-500 border-slate-200"
                            )}>
                                {match.status.replace('_', ' ')}
                                {(isLive || match.status === 'HALF_TIME') && ` • ${match.minute}'`}
                            </div>
                        </div>

                        {/* Away Team */}
                        <div className="text-center w-full md:w-1/3 z-10">
                            <div className="w-20 h-20 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-2xl font-bold text-slate-700 mb-4 shadow-sm border border-slate-200">
                                {match.awayTeam.shortName.substring(0, 2).toUpperCase()}
                            </div>
                            <h2 className="text-2xl font-bold tracking-tight text-slate-900">{match.awayTeam.name}</h2>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 max-w-4xl mt-8">
                {/* Tabs */}
                <div className="flex border-b border-slate-200 mb-8 overflow-x-auto">
                    {['timeline', 'stats', 'chat'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={clsx(
                                "px-8 py-4 font-medium capitalize transition-all relative whitespace-nowrap",
                                activeTab === tab
                                    ? "text-blue-600"
                                    : "text-slate-500 hover:text-slate-900"
                            )}
                        >
                            {tab}
                            {activeTab === tab && (
                                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 shadow-sm"></div>
                            )}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 min-h-[400px] shadow-sm">
                    {activeTab === 'timeline' && (
                        <Timeline events={events} />
                    )}
                    {activeTab === 'stats' && (
                        <Statistics stats={stats} />
                    )}
                    {activeTab === 'chat' && id && (
                        <Chat matchId={id} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default MatchDetail;