import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getMySubmissions, createSubmission } from "../services/submission.service";

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
