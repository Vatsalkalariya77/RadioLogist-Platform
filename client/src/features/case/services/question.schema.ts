import { z } from "zod";

export const questionSchema = z.object({
  type: z.enum(["mcq", "text"]),
  questionText: z
    .string()
    .min(5, "Question text must be at least 5 characters")
    .max(500, "Question text cannot exceed 500 characters"),
  options: z
    .array(
      z.object({
        value: z.string().min(1, "Option cannot be empty"),
      })
    )
    .optional(),
  correctAnswer: z.string().optional(),
  expectedAnswer: z.string().optional(),
  marks: z
    .number()
    .min(1, "Marks must be at least 1")
    .max(20, "Marks cannot exceed 20"),
}).superRefine((data, ctx) => {
  if (data.type === "mcq") {
    if (!data.options || data.options.length !== 4) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Exactly 4 options are required",
        path: ["options"],
      });
    }

    if (!data.correctAnswer || data.correctAnswer.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Correct answer is required",
        path: ["correctAnswer"],
      });
    } else if (data.options) {
      const flatOptions = data.options.map((o) => o.value);
      if (!flatOptions.includes(data.correctAnswer)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Correct answer must match one of the provided options",
          path: ["correctAnswer"],
        });
      }
    }
  } else if (data.type === "text") {
    if (!data.expectedAnswer || data.expectedAnswer.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Expected answer is required",
        path: ["expectedAnswer"],
      });
    }
  }
});

export type QuestionFormValues = z.infer<typeof questionSchema>;

export interface CreateQuestionPayload {
  caseId: string;
  questionText: string;
  type: "mcq" | "text";
  options?: string[];
  correctAnswer?: string;
  expectedAnswer?: string;
  marks: number;
}
