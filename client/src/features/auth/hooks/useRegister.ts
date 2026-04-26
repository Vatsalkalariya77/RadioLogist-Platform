import { useMutation } from "@tanstack/react-query";
import { registerUser } from "../auth.service";
import type { AuthResponse, RegisterPayload } from "../auth.types";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export function useRegister() {
  const navigate = useNavigate();

  const mutation = useMutation<AuthResponse, Error, RegisterPayload>({
    mutationFn: registerUser,
    onSuccess: (data) => {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/student/dashboard");
    },
    onError: (error) => {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || error.message
        : error.message;
      console.error("Registration failed:", message);
    },
  });

  return {
    register: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error,
  };
}
