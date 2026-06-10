import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createCase, getCases, getCaseById, updateCase, deleteCase } from "../services/case.service";
import type { CreateCasePayload } from "../services/case.schema";

export function useCreateCase() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: createCase,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cases"] });
    },
  });

  return {
    createCase: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
  };
}

export function useGetCases(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ["cases", params],
    queryFn: () => getCases(params),
  });
}

export function useGetCase(id: string) {
  return useQuery({
    queryKey: ["case", id],
    queryFn: () => getCaseById(id),
    enabled: !!id,
  });
}

export function useUpdateCase() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateCasePayload> }) => updateCase(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["cases"] });
      queryClient.invalidateQueries({ queryKey: ["case", variables.id] });
    },
  });

  return {
    updateCase: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
  };
}

export function useDeleteCase() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: deleteCase,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cases"] });
    },
  });

  return {
    deleteCase: mutation.mutateAsync,
    isPending: mutation.isPending,
  };
}
