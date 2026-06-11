import api from "../../../services/api";

export const getMySubmissions = async () => {
  const response = await api.get("/submissions/me");
  return response.data;
};
