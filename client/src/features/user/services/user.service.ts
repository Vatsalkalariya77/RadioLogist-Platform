import api from "../../../services/api";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "student" | "admin" | "superadmin";
  status?: "active" | "blocked";
  createdAt: string;
}

export interface PaginatedUsers {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UserApiResponse<T> {
  status: string;
  data: T;
}

export const getUsers = async (params?: {
  search?: string;
  role?: string;
  page?: number;
  limit?: number;
}): Promise<UserApiResponse<PaginatedUsers>> => {
  const response = await api.get("/users", { params });
  return response.data;
};

export const updateUserRole = async (
  id: string,
  role: string
): Promise<UserApiResponse<User>> => {
  const response = await api.patch(`/users/${id}`, { role });
  return response.data;
};

export const createUser = async (
  payload: any
): Promise<UserApiResponse<User>> => {
  const response = await api.post("/users", payload);
  return response.data;
};

export const updateUserStatus = async (
  id: string,
  status: string
): Promise<UserApiResponse<User>> => {
  const response = await api.patch(`/users/${id}/status`, { status });
  return response.data;
};

export const deleteUser = async (
  id: string
): Promise<UserApiResponse<{ message: string }>> => {
  const response = await api.delete(`/users/${id}`);
  return response.data;
};
