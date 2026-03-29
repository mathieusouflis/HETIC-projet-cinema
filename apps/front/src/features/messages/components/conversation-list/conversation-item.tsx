import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { Conversation } from "../../types";

function formatTimestamp(dateStr: string | null): string {
  if (!dateStr) {
    return "";
  }
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const dayMs = 86_400_000;

  if (diff < dayMs) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  if (diff < 7 * dayMs) {
    return date.toLocaleDateString([], { weekday: "short" });
  }
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

interface ConversationItemProps {
  conversation: Conversation;
  /** Usernames of participants currently typing in this conversation */
  typingUsers: string[];
  isActive: boolean;
  onClick: () => void;
}

export function ConversationItem({
  conversation,
  typingUsers,
  isActive,
  onClick,
}: ConversationItemProps) {
  const { otherParticipant, lastMessage, unreadCount } = conversation;
  const initials = otherParticipant.username.slice(0, 2).toUpperCase();

  const isTyping = typingUsers.length > 0;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isActive && "bg-muted"
      )}
    >
      <Avatar size="default" className="shrink-0">
        {otherParticipant.avatarUrl && (
          <AvatarImage
            src={otherParticipant.avatarUrl}
            alt={otherParticipant.username}
          />
        )}
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate font-semibold text-sm">
            {otherParticipant.username}
          </span>
          {lastMessage && (
            <span className="shrink-0 text-xs text-muted-foreground">
              {formatTimestamp(lastMessage.createdAt)}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 mt-0.5">
          <p
            className={cn(
              "truncate text-xs",
              isTyping ? "text-primary italic" : "text-muted-foreground"
            )}
          >
            {isTyping
              ? `${typingUsers[0]} is writing…`
              : lastMessage?.isDeleted
                ? "Message deleted"
                : (lastMessage?.content ?? "")}
          </p>

          {/* Unread badge */}
          {unreadCount > 0 && (
            <span className="shrink-0 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground leading-none">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
