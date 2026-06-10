import api from "../../../services/api";
import type { CreateCasePayload } from "./case.schema";

export const createCase = async (payload: CreateCasePayload) => {
  const response = await api.post("/cases", payload);
  return response.data;
};

export const getCases = async (params?: { page?: number; limit?: number }) => {
  const response = await api.get("/cases", { params });
  return response.data;
};

export const getCaseById = async (id: string) => {
  const response = await api.get(`/cases/${id}`);
  return response.data;
};

export const updateCase = async (id: string, payload: Partial<CreateCasePayload>) => {
  const response = await api.patch(`/cases/${id}`, payload);
  return response.data;
};

export const deleteCase = async (id: string) => {
  const response = await api.delete(`/cases/${id}`);
  return response.data;
};
