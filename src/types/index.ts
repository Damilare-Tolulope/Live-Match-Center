export interface ApiResponse<T> {
    data: T;
}

export type MatchStatus =
    | 'NOT_STARTED'
    | 'FIRST_HALF'
    | 'HALF_TIME'
    | 'SECOND_HALF'
    | 'FULL_TIME';

export type TeamSide = 'home' | 'away';

export interface Team {
    name: string;
    shortName: string;
    logo?: string; // Optional, in case the API provides it
}

export interface MatchScore {
    home: number;
    away: number;
}

export interface Match {
    id: string;
    homeTeam: Team;
    awayTeam: Team;
    score: MatchScore;
    status: MatchStatus;
    minute: number;
    startTime: string; // ISO string
}

export type EventType =
    | 'GOAL'
    | 'YELLOW_CARD'
    | 'RED_CARD'
    | 'SUBSTITUTION'
    | 'FOUL'
    | 'SHOT';

export interface MatchEvent {
    id: string;
    matchId: string;
    type: EventType;
    minute: number;
    player: string;
    description: string;
    teamSide: TeamSide;
}

export interface MatchStats {
    possession: { home: number; away: number };
    shots: { home: number; away: number };
    shotsOnTarget: { home: number; away: number };
    corners: { home: number; away: number };
    fouls: { home: number; away: number };
    yellowCards: { home: number; away: number };
    redCards: { home: number; away: number };
}

export interface ChatMessage {
    id: string;
    matchId: string;
    userId: string;
    username: string;
    message: string;
    timestamp: string; // ISO string
}

export interface ChatUser {
    userId: string;
    username: string;
}
