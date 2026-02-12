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
                setMatch(data.data);
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

    if (loading) return <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-blue-500">Loading match details...</div>;
    if (!match) return <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-red-500">Match not found</div>;

    const isLive = match.status === 'FIRST_HALF' || match.status === 'SECOND_HALF';

    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-100 pb-20">
            {/* Navigation & Header */}
            <div className="relative bg-[#1e293b] border-b border-gray-800 pb-8 pt-6">
                <div className="container mx-auto px-4 max-w-4xl">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center text-gray-400 hover:text-white mb-6 transition-colors font-medium text-sm group"
                    >
                        <span className="mr-1 group-hover:-translate-x-1 transition-transform">&larr;</span> Back to Dashboard
                    </button>

                    {/* Scoreboard */}
                    <div className="flex flex-col md:flex-row justify-between items-center bg-gray-900/50 rounded-2xl p-8 border border-gray-800 relative overflow-hidden">
                        {/* Background Glow */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-blue-500/5 blur-3xl pointer-events-none"></div>

                        {/* Home Team */}
                        <div className="text-center w-full md:w-1/3 z-10">
                            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-2xl font-bold text-gray-300 mb-4 shadow-lg border border-gray-700">
                                {match.homeTeam.shortName.substring(0, 2).toUpperCase()}
                            </div>
                            <h2 className="text-2xl font-bold tracking-tight">{match.homeTeam.name}</h2>
                        </div>

                        {/* Score & Status */}
                        <div className="text-center w-full md:w-1/3 flex flex-col items-center my-6 md:my-0 z-10">
                            <div className={clsx(
                                "text-5xl font-black tracking-tight mb-2",
                                isLive ? "text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400" : "text-white"
                            )}>
                                {match.score?.home ?? 0} - {match.score?.away ?? 0}
                            </div>
                            <div className={clsx(
                                "text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border",
                                isLive ? "bg-red-500/20 text-red-500 border-red-500/30 animate-pulse" : "bg-gray-700/50 text-gray-400 border-gray-700"
                            )}>
                                {match.status.replace('_', ' ')}
                                {(isLive || match.status === 'HALF_TIME') && ` • ${match.minute}'`}
                            </div>
                        </div>

                        {/* Away Team */}
                        <div className="text-center w-full md:w-1/3 z-10">
                            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-2xl font-bold text-gray-300 mb-4 shadow-lg border border-gray-700">
                                {match.awayTeam.shortName.substring(0, 2).toUpperCase()}
                            </div>
                            <h2 className="text-2xl font-bold tracking-tight">{match.awayTeam.name}</h2>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 max-w-4xl mt-8">
                {/* Tabs */}
                <div className="flex border-b border-gray-800 mb-8 overflow-x-auto">
                    {['timeline', 'stats', 'chat'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={clsx(
                                "px-8 py-4 font-medium capitalize transition-all relative whitespace-nowrap",
                                activeTab === tab
                                    ? "text-blue-500"
                                    : "text-gray-400 hover:text-white"
                            )}
                        >
                            {tab}
                            {activeTab === tab && (
                                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 shadow-[0_-2px_8px_rgba(59,130,246,0.5)]"></div>
                            )}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="bg-[#1e293b]/50 rounded-2xl border border-gray-800 p-6 min-h-[400px]">
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