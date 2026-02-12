import axios from 'axios';
import type { Match } from '../types';

const API_BASE_URL = 'https://profootball.srv883830.hstgr.cloud/api';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const matchApi = {
    getAllMatches: async (): Promise<Match[]> => {
        const response = await apiClient.get<Match[]>('/matches');
        return response.data;
    },
    getLiveMatches: async (): Promise<Match[]> => {
        const response = await apiClient.get<Match[]>('/matches/live');
        return response.data;
    },
    getMatchById: async (id: string): Promise<Match> => {
        const response = await apiClient.get<Match>(`/matches/${id}`);
        return response.data;
    },
};

export default apiClient;
