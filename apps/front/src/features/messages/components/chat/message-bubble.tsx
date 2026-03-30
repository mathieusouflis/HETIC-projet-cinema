import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { Message, Participant } from "../../types";

function formatTime(dateStr: string | null): string {
  if (!dateStr) {
    return "";
  }
  const date = new Date(dateStr);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar: boolean;
  sender?: Participant;
  onEdit?: (messageId: string) => void;
}

export function MessageBubble({
  message,
  isOwn,
  showAvatar,
  sender,
}: MessageBubbleProps) {
  const { content, isDeleted } = message;

  const isInteractive = !isDeleted;

  return (
    <div
      className={cn(
        "group flex items-end gap-2",
        isOwn ? "justify-end" : "justify-start"
      )}
    >
      {!isOwn && (
        <div className="w-8 shrink-0">
          {showAvatar && sender && (
            <Avatar size="sm">
              {sender.avatarUrl && (
                <AvatarImage src={sender.avatarUrl} alt={sender.username} />
              )}
              <AvatarFallback>
                {sender.username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      )}

      <div className="relative max-w-[70%]">
        <div
          className={cn(
            "rounded-2xl px-3 py-2 text-sm max-w-full wrap-break-word",
            isOwn ? "bg-primary/10 rounded-br-sm" : "bg-muted rounded-bl-sm",
            isDeleted && "italic text-muted-foreground"
          )}
        >
          {isDeleted ? <span>Message deleted</span> : content}
        </div>

        <p
          className={cn(
            "mt-0.5 text-[10px] text-muted-foreground",
            isOwn ? "text-right" : "text-left"
          )}
        >
          {formatTime(message.createdAt)}
          {message.updatedAt && " · edited"}
        </p>

        {isInteractive && (
          <div
            className={cn(
              "absolute top-0 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 [@media(hover:none)]:opacity-30 [@media(hover:none)]:group-active:opacity-100",
              isOwn ? "-left-10" : "-right-10"
            )}
          >
            {/*EDIT COMMING SOON*/}
            {/*{isOwn && onEdit && (
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => onEdit(message.id)}
                aria-label="Edit message"
              >
                <Pencil />
              </Button>
            )}*/}
          </div>
        )}
      </div>
    </div>
  );
}
