import { useMutation } from "@tanstack/react-query";
import { forgotPassword } from "../services/auth.service";
import axios from "axios";
import { useToast } from "../../../context/ToastContext";

export function useForgotPassword() {
  const { showToast } = useToast();

  const mutation = useMutation<any, Error, string>({
    mutationFn: forgotPassword,
    onSuccess: (data) => {
      showToast("success", data.message || "If an account exists, password reset instructions have been sent.");
    },
    onError: (error) => {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || error.message
        : error.message;
      console.error("Forgot password request failed:", message);
    },
  });

  return {
    forgotPassword: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
  };
}
