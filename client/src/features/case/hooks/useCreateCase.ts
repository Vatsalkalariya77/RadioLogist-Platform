import { useMutation } from "@tanstack/react-query";
import { createCase } from "../services/case.service";

export function useCreateCase() {
  const mutation = useMutation({
    mutationFn: createCase,
  });

  return {
    createCase: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
  };
}
