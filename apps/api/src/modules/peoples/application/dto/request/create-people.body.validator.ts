import z from "zod";

export const createPeopleBodyValidator = z.object({
  name: z.string().min(1, "Name is required"),
  bio: z.string().nullable().optional(),
  photoUrl: z.url("Invalid photo URL").nullable().optional(),
  birthDate: z.date("Invalid date format").nullable().optional(),
  nationality: z.string().nullable().optional(),
  tmdbId: z.number().int().positive().nullable().optional(),
});

export type CreatePeopleBody = z.infer<typeof createPeopleBodyValidator>;
