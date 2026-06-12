import api from "../../../services/api";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "student" | "admin" | "superadmin";
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
