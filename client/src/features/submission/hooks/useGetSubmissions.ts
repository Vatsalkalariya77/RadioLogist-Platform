import { useQuery } from "@tanstack/react-query";
import { getMySubmissions } from "../services/submission.service";

export function useGetMySubmissions() {
  return useQuery({
    queryKey: ["submissions", "me"],
    queryFn: getMySubmissions,
  });
}
