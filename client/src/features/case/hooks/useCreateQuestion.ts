import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createQuestion, getQuestionsByCase, deleteQuestion } from "../services/question.service";

export function useCreateQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createQuestion,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["questions", variables.caseId] });
    },
  });
}

export function useGetQuestions(caseId: string) {
  return useQuery({
    queryKey: ["questions", caseId],
    queryFn: () => getQuestionsByCase(caseId),
    enabled: !!caseId,
  });
}

export function useDeleteQuestion(caseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteQuestion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questions", caseId] });
    },
  });
}
