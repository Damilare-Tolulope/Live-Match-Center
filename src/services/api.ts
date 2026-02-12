import axios from "axios";
import Auth from "./auth";

const API_URL = import.meta.env.VITE_API_BASE_URL

const Api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

Api.interceptors.request.use(
  (config) => {
    if (Auth.isAuthenticated()) {
      config.headers["Authorization"] = `Bearer ${Auth.getToken()}`;
    }
    return config;
  },
  (error: Error) => Promise.reject(error)
);

Api.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.log(error);

    if (error.response?.status === 401) {
      Auth.logOut();
    }

    if (error.response?.status === 403) {
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default Api;

