import { zodResolver } from "@hookform/resolvers/zod";
import type {
  GETContents200DataItemsItem,
  PUTWatchlistContentIdBody,
} from "@packages/api-sdk";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { DatePickerInput } from "@/components/common/date-picker-input";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { parseApiError } from "@/lib/api/parse-error";
import { useApi } from "@/lib/api/services";

export const WATCHLIST_FORM_ID = "watchlist-form";

const STATUS_OPTIONS = [
  { value: "plan_to_watch", label: "Plan to Watch" },
  { value: "watching", label: "Watching" },
  { value: "completed", label: "Completed" },
  { value: "dropped", label: "Dropped" },
  { value: "not_interested", label: "Not Interested" },
  { value: "undecided", label: "Undecided" },
] as const;

const formSchema = z.object({
  status: z.enum([
    "plan_to_watch",
    "watching",
    "completed",
    "dropped",
    "not_interested",
    "undecided",
  ]),
  currentSeason: z.number().min(1).optional(),
  currentEpisode: z.number().min(1).optional(),
  startedAt: z.string().optional(),
  completedAt: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function FormWatchlist(props: {
  content: GETContents200DataItemsItem;
  onSubmit?: () => void;
}) {
  const services = useApi();

  const { data: watchlistData, isLoading } = services.watchlist.getId(
    props.content.id
  );
  const { mutateAsync: updateWatchlist } = services.watchlist.updateContentId();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: "plan_to_watch",
      currentSeason: undefined,
      currentEpisode: undefined,
      startedAt: undefined,
      completedAt: undefined,
    },
  });

  useEffect(() => {
    if (watchlistData?.data) {
      const d = watchlistData.data.data;
      form.reset({
        status: d.status,
        currentSeason: d.currentSeason ?? undefined,
        currentEpisode: d.currentEpisode ?? undefined,
        startedAt: d.startedAt ? d.startedAt.slice(0, 10) : undefined,
        completedAt: d.completedAt ? d.completedAt.slice(0, 10) : undefined,
      });
    }
  }, [watchlistData, form.reset]);

  const onSubmit = async (values: FormValues) => {
    try {
      await updateWatchlist({
        id: props.content.id,
        data: values as PUTWatchlistContentIdBody,
      });
      props.onSubmit?.();
    } catch (err) {
      const { globalError } = parseApiError(err);
      if (globalError) {
        form.setError("root", { message: globalError });
      }
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }
  return (
    <form id={WATCHLIST_FORM_ID} onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <Controller
          name="status"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Status</FieldLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  className="w-full"
                >
                  <SelectValue placeholder="Select a status" />
                </SelectTrigger>
                <SelectContent className="z-[52]">
                  {STATUS_OPTIONS.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        {props.content.type === "serie" && (
          <>
            <Controller
              name="currentSeason"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Current Season</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="number"
                    min={1}
                    aria-invalid={fieldState.invalid}
                    placeholder="e.g. 1"
                    value={field.value ?? ""}
                    required
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? Number(e.target.value) : undefined
                      )
                    }
                    onBlur={field.onBlur}
                  />
                  {fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="currentEpisode"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Current Episode</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="number"
                    min={1}
                    required
                    aria-invalid={fieldState.invalid}
                    placeholder="e.g. 1"
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? Number(e.target.value) : undefined
                      )
                    }
                    onBlur={field.onBlur}
                  />
                  {fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </>
        )}
        <Controller
          name="startedAt"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Started At</FieldLabel>
              <DatePickerInput
                value={field.value}
                onChange={field.onChange}
                placeholder="Pick a start date"
              />
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="completedAt"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Completed At</FieldLabel>
              <DatePickerInput
                value={field.value}
                onChange={field.onChange}
                placeholder="Pick a completion date"
              />
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>
      {form.formState.errors.root && (
        <p className="text-destructive mt-2 text-sm">
          {form.formState.errors.root.message}
        </p>
      )}
    </form>
  );
}
