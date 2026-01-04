import { z } from "zod";

export const uuidSchema = z
  .string("ID must be a string")
  .nonempty("ID is required")
  .uuid("Invalid ID format");

export const uuidSchemaOptional = uuidSchema.optional();

export const uuidSchemaNullable = uuidSchema.nullable();

export type UUID = z.infer<typeof uuidSchema>;
