import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getMySubmissions,
  createSubmission,
  getAllSubmissions,
  getSubmissionById,
  reviewSubmission,
  type ReviewSubmissionPayload,
} from "../services/submission.service";

export function useGetMySubmissions() {
  return useQuery({
    queryKey: ["submissions", "me"],
    queryFn: getMySubmissions,
  });
}

export function useCreateSubmission() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: createSubmission,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["submissions", "me"] });
    },
  });

  return {
    submitDiagnosis: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
  };
}

export function useGetAllSubmissions(params?: {
  caseId?: string;
  userId?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ["submissions", "all", params],
    queryFn: () => getAllSubmissions(params),
  });
}

export function useGetSubmissionById(id: string) {
  return useQuery({
    queryKey: ["submissions", "details", id],
    queryFn: () => getSubmissionById(id),
    enabled: !!id,
  });
}

export function useReviewSubmission() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ReviewSubmissionPayload }) =>
      reviewSubmission(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["submissions", "all"] });
      queryClient.invalidateQueries({ queryKey: ["submissions", "details", variables.id] });
    },
  });

  return {
    submitReview: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
  };
}

