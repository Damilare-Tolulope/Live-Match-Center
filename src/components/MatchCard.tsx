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
        ? "bg-red-50 text-red-600 border-red-200"
        : isFinished
            ? "bg-slate-100 text-slate-500 border-slate-200"
            : isHalftime
                ? "bg-orange-50 text-orange-600 border-orange-200"
                : "bg-blue-50 text-blue-600 border-blue-200";

    return (
        <div
            onClick={() => navigate(`/match/${match.id}`)}
            className="group relative bg-white rounded-xl p-5 cursor-pointer hover:bg-slate-50 transition-all duration-300 border border-slate-200 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5 overflow-hidden"
        >
            {/* Glow effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

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
                    <span className="text-slate-500 text-xs font-mono bg-slate-100 px-2 py-1 rounded">
                        {isUpcoming ? new Date(match.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : `${match.minute}'`}
                    </span>
                </div>

                {/* Teams & Score */}
                <div className="flex justify-between items-center gap-4">
                    {/* Home Team */}
                    <div className="flex flex-col items-center w-5/12 text-center group-hover:transform group-hover:scale-105 transition-transform duration-300">
                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-lg font-bold text-slate-700 mb-3 shadow-sm border border-slate-200">
                            {match.homeTeam.shortName.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="text-sm font-semibold text-slate-800 leading-tight">
                            {match.homeTeam.name}
                        </span>
                    </div>

                    {/* Score */}
                    <div className="flex flex-col items-center w-2/12">
                        <div className={clsx(
                            "text-3xl font-black text-slate-900 tracking-tighter tabular-nums",
                            isLive && "text-transparent bg-clip-text bg-gradient-to-b from-slate-900 to-slate-600"
                        )}>
                            {match.score?.home ?? 0}
                            <span className="text-slate-400 mx-1">:</span>
                            {match.score?.away ?? 0}
                        </div>
                    </div>

                    {/* Away Team */}
                    <div className="flex flex-col items-center w-5/12 text-center group-hover:transform group-hover:scale-105 transition-transform duration-300">
                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-lg font-bold text-slate-700 mb-3 shadow-sm border border-slate-200">
                            {match.awayTeam.shortName.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="text-sm font-semibold text-slate-800 leading-tight">
                            {match.awayTeam.name}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MatchCard;
