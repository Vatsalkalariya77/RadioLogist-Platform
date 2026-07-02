import { useMutation } from "@tanstack/react-query";
import { changePassword } from "../services/auth.service";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useToast } from "../../../context/ToastContext";

export function useChangePassword() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const mutation = useMutation<any, Error, any>({
    mutationFn: changePassword,
    onSuccess: () => {
      // Clear session local storage since changePassword revokes sessions/refresh tokens on backend
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      showToast("success", "Password updated successfully! Please log in again.");
      navigate("/login");
    },
    onError: (error) => {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || error.message
        : error.message;
      console.error("Change password failed:", message);
    },
  });

  return {
    changePassword: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error,
  };
}
