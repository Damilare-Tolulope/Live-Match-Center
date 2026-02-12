import React from 'react';
import type { MatchEvent } from '../types';
import clsx from 'clsx';

interface TimelineProps {
    events: MatchEvent[];
}

const Timeline: React.FC<TimelineProps> = ({ events }) => {
    if (events.length === 0) {
        return <div className="text-center text-gray-500 py-20 italic">No events to display yet</div>;
    }

    const sortedEvents = [...events].sort((a, b) => b.minute - a.minute); // Reverse chronological usually better for "Timeline"

    return (
        <div className="relative max-w-3xl mx-auto py-4">
            {/* Central Line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-800 -translate-x-1/2"></div>

            <div className="space-y-8">
                {sortedEvents.map((event, index) => (
                    <div key={event.id || index} className={clsx(
                        "flex items-center justify-between w-full relative",
                        event.teamSide === 'home' ? "flex-row" : "flex-row-reverse"
                    )}>

                        {/* Event Card */}
                        <div className={clsx(
                            "w-[42%] p-4 rounded-xl border relative transition-all hover:bg-gray-800/50",
                            event.teamSide === 'home' ? "text-right border-gray-800 bg-[#1e293b]" : "text-left border-gray-800 bg-[#1e293b]"
                        )}>
                            {/* Arrow pointing to center */}
                            <div className={clsx(
                                "absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-[#1e293b] border-t border-r border-gray-800 rotate-45",
                                event.teamSide === 'home' ? "-right-1.5 border-l-0 border-b-0" : "-left-1.5 border-t-0 border-r-0 border-b border-l"
                            )}></div>

                            <div className="font-bold text-gray-200 text-sm mb-0.5">
                                {event.type.replace('_', ' ')}
                            </div>
                            <div className="text-blue-400 font-medium text-sm">
                                {event.player}
                            </div>
                            {event.description && (
                                <div className="text-xs text-gray-500 mt-1 leading-relaxed">
                                    {event.description}
                                </div>
                            )}
                        </div>

                        {/* Minute Marker */}
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                            <div className="w-10 h-10 rounded-full bg-[#0f172a] border-4 border-gray-800 flex items-center justify-center text-xs font-bold text-gray-400 shadow-lg">
                                {event.minute}'
                            </div>
                        </div>

                        <div className="w-[42%]"></div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Timeline;
