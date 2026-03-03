import "reflect-metadata";
import type { z } from "zod";
import { METADATA_KEYS, type ValidationMetadata } from "./metadata.js";

function getOrCreateValidationMetadata(
  target: object,
  propertyKey: string
): ValidationMetadata {
  const key = `${METADATA_KEYS.ROUTE_VALIDATION.toString()}_${propertyKey}`;

  let metadata = Reflect.getMetadata(key, target);

  if (!metadata) {
    metadata = {};
    Reflect.defineMetadata(key, metadata, target);
  }

  return metadata;
}

export function ValidateBody(schema: z.ZodSchema) {
  return (
    target: object,
    propertyKey: string,
    _descriptor?: PropertyDescriptor
  ): void => {
    const metadata = getOrCreateValidationMetadata(target, propertyKey);
    metadata.body = schema;
  };
}

export function ValidateParams(schema: z.ZodSchema) {
  return (
    target: object,
    propertyKey: string,
    _descriptor?: PropertyDescriptor
  ): void => {
    const metadata = getOrCreateValidationMetadata(target, propertyKey);
    metadata.params = schema;
  };
}

export function ValidateQuery(schema: z.ZodSchema) {
  return (
    target: object,
    propertyKey: string,
    _descriptor?: PropertyDescriptor
  ): void => {
    const metadata = getOrCreateValidationMetadata(target, propertyKey);
    metadata.query = schema;
  };
}
