import api from "../../../services/api";

export interface CreateSubmissionPayload {
  caseId: string;
  answers: {
    questionId: string;
    answer: string;
  }[];
}

export interface SubmissionCaseInfo {
  id: string;
  title: string;
}

export interface SubmissionUserInfo {
  id: string;
  name: string;
  email: string;
}

export interface SubmissionQuestionInfo {
  id: string;
  questionText: string;
  type: "mcq" | "text";
  marks: number;
}

export interface SubmissionAnswer {
  questionId: SubmissionQuestionInfo;
  answer: string;
}

export interface Submission {
  id: string;
  caseId: SubmissionCaseInfo;
  userId: SubmissionUserInfo;
  answers: SubmissionAnswer[];
  status: "submitted" | "reviewed";
  feedback?: string;
  score?: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedSubmissions {
  submissions: Submission[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ReviewSubmissionPayload {
  score: number;
  feedback?: string;
}

export interface SubmissionApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

export const getMySubmissions = async (): Promise<SubmissionApiResponse<Submission[]>> => {
  const response = await api.get("/submissions/me");
  return response.data;
};

export const createSubmission = async (payload: CreateSubmissionPayload): Promise<SubmissionApiResponse<Submission>> => {
  const response = await api.post("/submissions", payload);
  return response.data;
};

export const getAllSubmissions = async (params?: {
  caseId?: string;
  userId?: string;
  page?: number;
  limit?: number;
}): Promise<SubmissionApiResponse<PaginatedSubmissions>> => {
  const response = await api.get("/submissions", { params });
  return response.data;
};

export const getSubmissionById = async (id: string): Promise<SubmissionApiResponse<Submission>> => {
  const response = await api.get(`/submissions/${id}`);
  return response.data;
};

export const reviewSubmission = async (
  id: string,
  payload: ReviewSubmissionPayload
): Promise<SubmissionApiResponse<Submission>> => {
  const response = await api.patch(`/submissions/${id}/review`, payload);
  return response.data;
};

