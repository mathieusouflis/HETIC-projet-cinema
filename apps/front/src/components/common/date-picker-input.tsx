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

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

function isValidDate(date: Date | undefined) {
  if (!date) {
    return false;
  }
  return !Number.isNaN(date.getTime());
}

function parseDDMMYYYY(input: string): Date | undefined {
  const match = input.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (!match) {
    return undefined;
  }
  const [, day, month, year] = match;
  const date = new Date(`${year}-${month}-${day}T12:00:00`);
  return isValidDate(date) ? date : undefined;
}

interface DatePickerInputProps {
  value?: Date;
  onChange?: (value: Date | undefined) => void;
  placeholder?: string;
  id?: string;
}

export function DatePickerInput({
  value,
  onChange,
  placeholder = "01-06-2025",
  id,
}: DatePickerInputProps) {
  const [open, setOpen] = React.useState(false);
  const [month, setMonth] = React.useState<Date | undefined>(value);
  const [inputValue, setInputValue] = React.useState(formatDate(value));

  React.useEffect(() => {
    setInputValue(formatDate(value));
    setMonth(value);
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
          const parsed = parseDDMMYYYY(typed);
          if (parsed) {
            setMonth(parsed);
            onChange?.(parsed);
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
            className="z-52 w-auto overflow-hidden p-0"
            align="end"
            alignOffset={-8}
            sideOffset={10}
          >
            <Calendar
              mode="single"
              selected={value}
              month={month}
              onMonthChange={setMonth}
              onSelect={(selected) => {
                setInputValue(formatDate(selected));
                onChange?.(selected ?? undefined);
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
            onClick={() => {
              setInputValue("");
              onChange?.(undefined);
            }}
          >
            <X />
          </Button>
        )}
      </InputGroupAddon>
    </InputGroup>
  );
}
