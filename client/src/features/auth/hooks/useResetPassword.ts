import { useMutation } from "@tanstack/react-query";
import { resetPassword } from "../services/auth.service";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useToast } from "../../../context/ToastContext";

export function useResetPassword() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const mutation = useMutation<any, Error, any>({
    mutationFn: resetPassword,
    onSuccess: () => {
      showToast("success", "Password reset successful! Please log in.");
      navigate("/login");
    },
    onError: (error) => {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || error.message
        : error.message;
      console.error("Reset password failed:", message);
    },
  });

  return {
    resetPassword: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error,
  };
}
