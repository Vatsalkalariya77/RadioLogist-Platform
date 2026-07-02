import api from "../../../services/api";
import type { LoginPayload, RegisterPayload } from "../../../types/auth";

export const loginUser = async (payload: LoginPayload) => {
  const response = await api.post("/auth/login", payload);
  return response.data;
};

export const registerUser = async (payload: RegisterPayload) => {
  const response = await api.post("/auth/register", payload);
  return response.data;
};

export const logoutUser = async () => {
  const response = await api.post("/auth/logout");
  return response.data;
};

export const refreshToken = async () => {
  const response = await api.post("/auth/refresh");
  return response.data;
};

export const forgotPassword = async (email: string) => {
  const response = await api.post("/auth/forgot-password", { email });
  return response.data;
};

export const resetPassword = async (payload: any) => {
  const response = await api.post("/auth/reset-password", payload);
  return response.data;
};

export const changePassword = async (payload: any) => {
  const response = await api.patch("/auth/change-password", payload);
  return response.data;
};
