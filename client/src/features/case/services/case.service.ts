import api from "../../../services/api";
import type { CreateCasePayload } from "./case.schema";

export const createCase = async (payload: CreateCasePayload) => {
  const response = await api.post("/cases", payload);
  return response.data;
};
