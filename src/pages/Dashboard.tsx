import { useEffect, useState } from 'react';
import { matchApi } from '../api/client';
import { useSocket } from '../hooks/useSocket';
import type { Match, MatchScore, MatchStatus } from '../types';
import MatchCard from '../components/MatchCard';
import clsx from 'clsx';

const Dashboard = () => {
    const [matches, setMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { socket, isConnected } = useSocket();

    useEffect(() => {
        const fetchMatches = async () => {
            try {
                const data = await matchApi.getAllMatches();
                setMatches(data.data.matches);
            } catch (err) {
                console.error("Failed to fetch matches:", err);
                setError('Failed to load matches.');
            } finally {
                setLoading(false);
            }
        };

        fetchMatches();
    }, []);

    useEffect(() => {
        if (!socket) return;

        const handleScoreUpdate = (data: { matchId: string; score: MatchScore }) => {
            setMatches((prev) =>
                prev.map((m) =>
                    m.id === data.matchId ? { ...m, score: data.score } : m
                )
            );
        };

        const handleStatusChange = (data: { matchId: string; status: MatchStatus }) => {
            setMatches((prev) =>
                prev.map((m) =>
                    m.id === data.matchId ? { ...m, status: data.status } : m
                )
            );
        };

        // Listen for time updates if available, or any other relevant events
        // Assumed event: 'match_update' for general updates including time
        const handleMatchUpdate = (data: Partial<Match> & { id: string }) => {
            setMatches((prev) =>
                prev.map((m) =>
                    m.id === data.id ? { ...m, ...data } : m
                )
            );
        };

        socket.on('score_update', handleScoreUpdate);
        socket.on('status_change', handleStatusChange);
        socket.on('match_update', handleMatchUpdate); // Fallback/General update

        return () => {
            socket.off('score_update', handleScoreUpdate);
            socket.off('status_change', handleStatusChange);
            socket.off('match_update', handleMatchUpdate);
        };
    }, [socket]);

    if (loading) return <div className="text-center text-white p-10">Loading matches...</div>;
    if (error) return <div className="text-center text-red-500 p-10">{error}</div>;

    const liveMatches = matches?.filter(m => m.status === 'FIRST_HALF' || m.status === 'SECOND_HALF' || m.status === 'HALF_TIME');
    const finishedMatches = matches?.filter(m => m.status === 'FULL_TIME');
    const upcomingMatches = matches?.filter(m => m.status === 'NOT_STARTED');

    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-100 pb-20">
            {/* Navbar */}
            <nav className="sticky top-0 z-50 backdrop-blur-md bg-[#0f172a]/80 border-b border-gray-800/50">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-lg shadow-lg shadow-blue-500/20">MC</div>
                        <h1 className="text-xl font-bold tracking-tight">Live Match Center</h1>
                    </div>
                    <div className="flex items-center gap-3 bg-gray-900/50 px-3 py-1.5 rounded-full border border-gray-800">
                        <div className={clsx(
                            "h-2.5 w-2.5 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)] transition-colors duration-500",
                            isConnected ? "bg-emerald-500 shadow-emerald-500/50" : "bg-red-500 shadow-red-500/50"
                        )}></div>
                        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">{isConnected ? 'Online' : 'Offline'}</span>
                    </div>
                </div>
            </nav>

            <main className="container mx-auto px-4 py-8 space-y-12">
                {liveMatches && liveMatches.length > 0 && (
                    <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="flex items-center gap-3 mb-6">
                            <h2 className="text-lg font-bold text-white uppercase tracking-wider">Live Now</h2>
                            <div className="h-[1px] flex-1 bg-gradient-to-r from-red-500/50 to-transparent"></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {liveMatches.map(match => (
                                <MatchCard key={match.id} match={match} />
                            ))}
                        </div>
                    </section>
                )}

                {upcomingMatches && upcomingMatches.length > 0 && (
                    <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
                        <div className="flex items-center gap-3 mb-6">
                            <h2 className="text-lg font-bold text-gray-300 uppercase tracking-wider">Upcoming</h2>
                            <div className="h-[1px] flex-1 bg-gray-800"></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {upcomingMatches.map(match => (
                                <MatchCard key={match.id} match={match} />
                            ))}
                        </div>
                    </section>
                )}

                {finishedMatches && finishedMatches.length > 0 && (
                    <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
                        <div className="flex items-center gap-3 mb-6">
                            <h2 className="text-lg font-bold text-gray-400 uppercase tracking-wider">Completed</h2>
                            <div className="h-[1px] flex-1 bg-gray-800"></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {finishedMatches.map(match => (
                                <MatchCard key={match.id} match={match} />
                            ))}
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
};
export default Dashboard;
