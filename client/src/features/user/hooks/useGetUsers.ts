import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getUsers, updateUserRole } from "../services/user.service";

export function useGetUsers(params?: {
  search?: string;
  role?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ["users", params],
    queryFn: () => getUsers(params),
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) =>
      updateUserRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  return {
    updateUserRole: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
  };
}
