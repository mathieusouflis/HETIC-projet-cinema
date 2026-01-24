import { z } from "zod";

export const uuidSchema = z
  .uuid({ message: "Invalid ID format", version: "v4" })
  .nonempty("ID is required");

export const uuidSchemaOptional = uuidSchema.optional();

export const uuidSchemaNullable = uuidSchema.nullable();

export type UUID = z.infer<typeof uuidSchema>;
