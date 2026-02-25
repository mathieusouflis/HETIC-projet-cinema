import { isAxiosError } from "axios";

type FieldErrors = Record<string, string>;

type ParsedApiError = {
  fieldErrors: FieldErrors;
  globalError: string | null;
};

type ApiErrorDetail = {
  field?: string;
  message?: string;
  code?: string;
};

// Actual shape emitted by the API error middleware:
// { success: false, error: string, details?: ApiErrorDetail[] }
type ApiErrorBody = {
  success?: false;
  error?: string;
  details?: ApiErrorDetail[];
};

/**
 * Parses an API error into field-level and global error messages.
 *
 * Matches the actual error shape from the backend error middleware:
 *   { success: false, error: string, details?: { field, message, code }[] }
 *
 * Field errors can be fed directly into react-hook-form via
 * `form.setError(field, { message })`.
 *
 * Global errors are banner-level messages for non-field errors.
 */
export function parseApiError(err: unknown): ParsedApiError {
  if (!isAxiosError(err)) {
    return {
      fieldErrors: {},
      globalError: "An unexpected error occurred. Please try again.",
    };
  }

  const body = err.response?.data as ApiErrorBody | undefined;

  if (!body || typeof body.error !== "string") {
    return {
      fieldErrors: {},
      globalError: "An unexpected error occurred. Please try again.",
    };
  }

  const fieldErrors: FieldErrors = {};

  if (body.details?.length) {
    for (const detail of body.details) {
      if (detail.field && detail.message) {
        fieldErrors[detail.field] = detail.message;
      }
    }
  }

  const hasFieldErrors = Object.keys(fieldErrors).length > 0;

  return {
    fieldErrors,
    globalError: hasFieldErrors
      ? null
      : (body.error ?? "Something went wrong. Please try again."),
  };
}
