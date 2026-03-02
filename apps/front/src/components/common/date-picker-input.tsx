"use client";

import { CalendarIcon, X } from "lucide-react";
import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "../ui/button";

function formatDate(date: Date | undefined) {
  if (!date) {
    return "";
  }

  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function isValidDate(date: Date | undefined) {
  if (!date) {
    return false;
  }
  return !isNaN(date.getTime());
}

function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

interface DatePickerInputProps {
  value?: string;
  onChange?: (value: string | undefined) => void;
  placeholder?: string;
  id?: string;
}

export function DatePickerInput({
  value,
  onChange,
  placeholder = "June 01, 2025",
  id,
}: DatePickerInputProps) {
  const dateFromValue = value ? new Date(`${value}T12:00:00`) : undefined;

  const [open, setOpen] = React.useState(false);
  const [month, setMonth] = React.useState<Date | undefined>(dateFromValue);
  const [inputValue, setInputValue] = React.useState(formatDate(dateFromValue));

  React.useEffect(() => {
    const next = value ? new Date(`${value}T12:00:00`) : undefined;
    setInputValue(formatDate(next));
    setMonth(next);
  }, [value]);

  return (
    <InputGroup>
      <InputGroupInput
        id={id}
        value={inputValue}
        placeholder={placeholder}
        onChange={(e) => {
          const typed = e.target.value;
          setInputValue(typed);
          const parsed = new Date(typed);
          if (isValidDate(parsed)) {
            setMonth(parsed);
            onChange?.(toISODate(parsed));
          } else if (!typed) {
            onChange?.(undefined);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setOpen(true);
          }
        }}
      />
      <InputGroupAddon align="inline-end" className="justify-end gap-0.5">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <InputGroupButton
              variant="ghost"
              size="icon-xs"
              aria-label="Select date"
            >
              <CalendarIcon />
              <span className="sr-only">Select date</span>
            </InputGroupButton>
          </PopoverTrigger>
          <PopoverContent
            className="z-[52] w-auto overflow-hidden p-0"
            align="end"
            alignOffset={-8}
            sideOffset={10}
          >
            <Calendar
              mode="single"
              selected={dateFromValue}
              month={month}
              onMonthChange={setMonth}
              onSelect={(selected) => {
                setInputValue(formatDate(selected));
                onChange?.(selected ? toISODate(selected) : undefined);
                setOpen(false);
              }}
            />
          </PopoverContent>
        </Popover>
        {inputValue && (
          <Button
            variant={"ghost"}
            size={"sm"}
            className="aspect-square w-fit"
            onClick={() => setInputValue("")}
          >
            <X />
          </Button>
        )}
      </InputGroupAddon>
    </InputGroup>
  );
}
