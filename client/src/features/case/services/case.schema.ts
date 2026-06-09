import { z } from "zod";

export const createCaseSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title cannot exceed 200 characters"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(5000, "Description cannot exceed 5000 characters"),
  modality: z.enum(["CT", "MRI", "X-Ray", "Ultrasound"]),
  difficulty: z.enum(["easy", "medium", "hard"]),
  tags: z.string(),
});

export type CreateCaseFormValues = z.infer<typeof createCaseSchema>;

export interface CreateCasePayload {
  title: string;
  description: string;
  modality: string;
  difficulty: "easy" | "medium" | "hard";
  tags: string[];
}
