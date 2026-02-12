import React from 'react';
import type { MatchStats } from '../types';

interface StatisticsProps {
    stats: MatchStats | null;
}

const StatRow = ({ label, home, away }: { label: string; home: number; away: number }) => {
    const total = home + away;
    const homePercent = total === 0 ? 50 : (home / total) * 100;
    const awayPercent = total === 0 ? 50 : (away / total) * 100;

    return (
        <div className="mb-4">
            <div className="flex justify-between text-sm text-slate-500 mb-1">
                <span>{home}</span>
                <span>{label}</span>
                <span>{away}</span>
            </div>
            <div className="flex h-2 bg-slate-200 rounded overflow-hidden">
                <div
                    style={{ width: `${homePercent}%` }}
                    className="bg-blue-500 transition-all duration-500"
                />
                <div
                    style={{ width: `${awayPercent}%` }}
                    className="bg-red-500 transition-all duration-500"
                />
            </div>
        </div>
    );
};

const Statistics: React.FC<StatisticsProps> = ({ stats }) => {
    if (!stats) {
        return <div className="text-center text-gray-400 py-10">No statistics available</div>;
    }

    return (
        <div className="bg-white rounded-lg p-6 max-w-2xl mx-auto border border-slate-200 shadow-sm">
            <StatRow label="Possession %" home={stats.possession.home} away={stats.possession.away} />
            <StatRow label="Shots" home={stats.shots.home} away={stats.shots.away} />
            <StatRow label="Shots on Target" home={stats.shotsOnTarget.home} away={stats.shotsOnTarget.away} />
            <StatRow label="Corners" home={stats.corners.home} away={stats.corners.away} />
            <StatRow label="Fouls" home={stats.fouls.home} away={stats.fouls.away} />
            <StatRow label="Yellow Cards" home={stats.yellowCards.home} away={stats.yellowCards.away} />
            <StatRow label="Red Cards" home={stats.redCards.home} away={stats.redCards.away} />
        </div>
    );
};

export default Statistics;
