import React from 'react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import type { Match } from '../types';

interface MatchCardProps {
    match: Match;
}

const MatchCard: React.FC<MatchCardProps> = ({ match }) => {
    const navigate = useNavigate();

    const isLive = match.status === 'FIRST_HALF' || match.status === 'SECOND_HALF';
    const isHalftime = match.status === 'HALF_TIME';
    const isFinished = match.status === 'FULL_TIME';
    const isUpcoming = match.status === 'NOT_STARTED';

    const statusColor = isLive
        ? "bg-red-500/20 text-red-500 border-red-500/30"
        : isFinished
            ? "bg-gray-700/50 text-gray-400 border-gray-600/30"
            : isHalftime
                ? "bg-orange-500/20 text-orange-400 border-orange-500/30"
                : "bg-blue-500/20 text-blue-400 border-blue-500/30";

    return (
        <div
            onClick={() => navigate(`/match/${match.id}`)}
            className="group relative bg-[#1e293b] rounded-xl p-5 cursor-pointer hover:bg-[#253248] transition-all duration-300 border border-gray-800 hover:border-gray-700 hover:shadow-lg hover:shadow-black/20 overflow-hidden"
        >
            {/* Glow effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative z-10">
                {/* Header: Status & Time */}
                <div className="flex justify-between items-center mb-6">
                    <span className={clsx(
                        "text-[10px] font-bold px-2.5 py-1 rounded-full border tracking-wide uppercase",
                        statusColor,
                        isLive && "animate-pulse"
                    )}>
                        {match.status.replace('_', ' ')}
                    </span>
                    <span className="text-gray-400 text-xs font-mono bg-gray-900/50 px-2 py-1 rounded">
                        {isUpcoming ? new Date(match.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : `${match.minute}'`}
                    </span>
                </div>

                {/* Teams & Score */}
                <div className="flex justify-between items-center gap-4">
                    {/* Home Team */}
                    <div className="flex flex-col items-center w-5/12 text-center group-hover:transform group-hover:scale-105 transition-transform duration-300">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-lg font-bold text-gray-300 mb-3 shadow-inner border border-gray-700">
                            {match.homeTeam.shortName.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="text-sm font-semibold text-gray-200 leading-tight">
                            {match.homeTeam.name}
                        </span>
                    </div>

                    {/* Score */}
                    <div className="flex flex-col items-center w-2/12">
                        <div className={clsx(
                            "text-3xl font-black text-white tracking-tighter tabular-nums",
                            isLive && "text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400"
                        )}>
                            {match.score?.home ?? 0}
                            <span className="text-gray-600 mx-1">:</span>
                            {match.score?.away ?? 0}
                        </div>
                    </div>

                    {/* Away Team */}
                    <div className="flex flex-col items-center w-5/12 text-center group-hover:transform group-hover:scale-105 transition-transform duration-300">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-lg font-bold text-gray-300 mb-3 shadow-inner border border-gray-700">
                            {match.awayTeam.shortName.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="text-sm font-semibold text-gray-200 leading-tight">
                            {match.awayTeam.name}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MatchCard;
