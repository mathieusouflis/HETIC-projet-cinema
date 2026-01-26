import z from "zod";

export const updatePeopleBodyValidator = z.object({
  name: z.string().min(1, "Name must not be empty").optional(),
  bio: z.string().nullable().optional(),
  photoUrl: z.url("Invalid photo URL").nullable().optional(),
  birthDate: z.date("Invalid date format").nullable().optional(),
  nationality: z.string().nullable().optional(),
  tmdbId: z.number().int().positive().nullable().optional(),
});

export type UpdatePeopleBody = z.infer<typeof updatePeopleBodyValidator>;
