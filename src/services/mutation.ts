import { useMutation } from '@tanstack/react-query';
import Api from './api';

// Auth
export const useAuthLogin = () => {
  return useMutation({
    mutationFn: async (data) => {
      const res = await Api.post('/api/auth/login/', data);
      return res.data;
    },
  });
};
