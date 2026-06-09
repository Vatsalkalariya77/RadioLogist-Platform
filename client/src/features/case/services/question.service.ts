import api from "../../../services/api";
import type { CreateQuestionPayload } from "./question.schema";

export const createQuestion = async (payload: CreateQuestionPayload) => {
  const response = await api.post("/questions", payload);
  return response.data;
};

export const getQuestionsByCase = async (caseId: string) => {
  const response = await api.get(`/questions/case/${caseId}`);
  return response.data;
};

export const updateQuestion = async (id: string, payload: Partial<CreateQuestionPayload>) => {
  const response = await api.patch(`/questions/${id}`, payload);
  return response.data;
};

export const deleteQuestion = async (id: string) => {
  const response = await api.delete(`/questions/${id}`);
  return response.data;
};
