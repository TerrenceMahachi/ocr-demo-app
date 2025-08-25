import { z } from "zod";

export const RequestDTO = z.object({
  iD: z.number(),
  name: z.string().nullable().optional(),
  dob: z.string().nullable().optional(),
  file: z.string().nullable().optional(),
  text: z.string().nullable().optional(),
  ai_text: z.string().nullable().optional(),
  created_at: z.string()
});
