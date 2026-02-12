import { useQuery } from "@tanstack/react-query";
import Api from "./api";

// Auth
export const useGetAuthRegisterStatus = () => {
  return useQuery({
    queryKey: ["auth_register_status"],
    queryFn: async () => {
      const res = await Api.get(`/api/auth/register/status/`);
      return res.data;
    },
  });
};
