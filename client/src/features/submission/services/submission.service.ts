import api from "../../../services/api";

export interface CreateSubmissionPayload {
  caseId: string;
  answers: {
    questionId: string;
    answer: string;
  }[];
}

export const getMySubmissions = async () => {
  const response = await api.get("/submissions/me");
  return response.data;
};

export const createSubmission = async (payload: CreateSubmissionPayload) => {
  const response = await api.post("/submissions", payload);
  return response.data;
};
