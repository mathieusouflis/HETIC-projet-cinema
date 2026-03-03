import { ArrowUp, Paperclip } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MessageInputProps {
  onSend: (content: string) => void;
  onTyping: () => void;
  disabled?: boolean;
  sendError?: string | null;
  onRetry?: () => void;
}

export function MessageInput({
  onSend,
  onTyping,
  disabled,
  sendError,
  onRetry,
}: MessageInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isEmpty = value.trim().length === 0;

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    onTyping();

    const el = e.target;
    el.style.height = "auto";
    const lineHeight = 24; // px per row
    const maxHeight = lineHeight * 4;
    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
  };

  return (
    <div className="border-t bg-background">
      {sendError && (
        <button
          type="button"
          onClick={onRetry}
          className="w-full px-4 pt-2 pb-0 text-xs text-destructive text-left hover:underline"
        >
          {sendError}
        </button>
      )}
      <div className="flex items-end gap-2 px-4 py-3">
        {/* Attachment button — reserved for future use */}
        <Button
          variant="ghost"
          size="icon-sm"
          disabled
          aria-label="Add attachment"
          className="shrink-0 self-end"
        >
          <Paperclip />
        </Button>

        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Write a message…"
          rows={1}
          disabled={disabled}
          className={cn(
            "flex-1 resize-none rounded-2xl border bg-muted/50 px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring disabled:opacity-50",
            "max-h-24 overflow-y-auto"
          )}
        />

        <Button
          size="icon-sm"
          onClick={handleSend}
          disabled={isEmpty || disabled}
          aria-label="Send message"
          className="shrink-0 self-end"
        >
          <ArrowUp />
        </Button>
      </div>
    </div>
  );
}
