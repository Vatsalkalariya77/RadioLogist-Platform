import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getUsers,
  updateUserRole,
  createUser,
  updateUserStatus,
  deleteUser,
} from "../services/user.service";
import { useToast } from "../../../context/ToastContext";
import axios from "axios";

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
  const { showToast } = useToast();

  const mutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) =>
      updateUserRole(id, role),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      showToast("success", `Role updated successfully to ${data.data.role}.`);
    },
    onError: (error) => {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || error.message
        : error instanceof Error
        ? error.message
        : "Failed to update user role";
      showToast("error", message);
    },
  });

  return {
    updateUserRole: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
  };
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const mutation = useMutation({
    mutationFn: (payload: any) => createUser(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      showToast("success", `Account for ${data.data.name} created successfully.`);
    },
    onError: (error) => {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || error.message
        : error instanceof Error
        ? error.message
        : "Failed to create user account";
      showToast("error", message);
    },
  });

  return {
    createUser: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
  };
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateUserStatus(id, status),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      showToast("success", `Account status changed successfully to ${data.data.status}.`);
    },
    onError: (error) => {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || error.message
        : error instanceof Error
        ? error.message
        : "Failed to update user status";
      showToast("error", message);
    },
  });

  return {
    updateUserStatus: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
  };
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const mutation = useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      showToast("success", "Account deleted successfully.");
    },
    onError: (error) => {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || error.message
        : error instanceof Error
        ? error.message
        : "Failed to delete user account";
      showToast("error", message);
    },
  });

  return {
    deleteUser: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
  };
}
