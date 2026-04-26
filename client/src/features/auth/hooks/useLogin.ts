import { useMutation } from "@tanstack/react-query";
import { loginUser } from "../auth.service";
import type { AuthResponse, LoginPayload } from "../auth.types";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export function useLogin() {
  const navigate = useNavigate();

  const mutation = useMutation<AuthResponse, Error, LoginPayload>({
    mutationFn: loginUser,
    onSuccess: (data) => {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Role-based redirect
      if (data.user.role === "admin") {
        navigate("/admin/dashboard");
      } else if (data.user.role === "student") {
        navigate("/student/dashboard");
      } else {
        navigate("/");
      }
    },
    onError: (error) => {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || error.message
        : error.message;
      console.error("Login failed:", message);
    },
  });

  return {
    login: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error,
  };
}