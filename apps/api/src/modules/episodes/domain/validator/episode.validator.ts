import z from "zod";

export const episodeValidator = z.object({
  id: z.string(),
  name: z.string().min(1),
  seasonId: z.string(),
  episodeNumber: z.number().int().nonnegative(),
  overview: z.string().nullable(),
  stillUrl: z.url().nullable(),
  airDate: z.string().nullable(),
  durationMinutes: z.number().int().nonnegative().nullable(),
  tmdbId: z.number().int().nullable(),
});

export type EpisodeValidatorType = z.infer<typeof episodeValidator>;

export const parseEpisode = (input: unknown) => episodeValidator.parse(input);
