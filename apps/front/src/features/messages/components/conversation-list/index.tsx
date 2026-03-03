import { useNavigate } from "@tanstack/react-router";
import { Plus, Search } from "lucide-react";
import { useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { Button } from "@/components/ui/button";
import { queryConversationService } from "@/lib/api/services/conversations";
import { cn } from "@/lib/utils";
import { useTypingStore } from "../../stores/typing.store";
import {
  CONVERSATION_FILTER_LABELS,
  type Conversation,
  type ConversationFilter,
} from "../../types";
import { NewConversationDialog } from "../new-conversation-dialog";
import { ConversationItem } from "./conversation-item";
import { ConversationItemSkeleton } from "./conversation-item-skeleton";

const EMPTY_TYPING_USERS: string[] = [];

interface ConversationListProps {
  activeConversationId?: string;
}

export function ConversationList({
  activeConversationId,
}: ConversationListProps) {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<ConversationFilter>("all");
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const typingByConversation = useTypingStore(
    useShallow((s) => s.typingByConversation)
  );
  const markRead = queryConversationService.markRead();

  const { data: conversations, isLoading } = queryConversationService.list();

  const filtered = (conversations ?? []).filter((c: Conversation) => {
    if (filter === "unread") return c.unreadCount > 0;
    if (filter === "groups") return false; // disabled in MVP
    return true;
  });

  const visible = search
    ? filtered.filter((c: Conversation) =>
        c.otherParticipant.username.toLowerCase().includes(search.toLowerCase())
      )
    : filtered;

  const handleClick = (conversation: Conversation) => {
    markRead.mutate(conversation.id);
    navigate({
      to: "/messages/$conversationId",
      params: { conversationId: conversation.id },
    });
  };

  return (
    <div className="flex flex-col h-full border-r relative">
      <div className="shrink-0 px-4 pt-4 pb-2 space-y-3">
        <h2 className="text-lg font-bold">Messages</h2>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-full border bg-muted/30 pl-9 pr-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="flex gap-1">
          {(
            Object.entries(CONVERSATION_FILTER_LABELS) as [
              ConversationFilter,
              string,
            ][]
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              disabled={key === "groups"}
              onClick={() => setFilter(key)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                filter === key
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => (
              <ConversationItemSkeleton key={i} />
            ))
          : visible.map((conv: Conversation) => {
              const typingUserIds =
                typingByConversation[conv.id] ?? EMPTY_TYPING_USERS;
              const typingUsernames = typingUserIds.includes(
                conv.otherParticipant.id
              )
                ? [conv.otherParticipant.username]
                : EMPTY_TYPING_USERS;

              return (
                <ConversationItem
                  key={conv.id}
                  conversation={conv}
                  typingUsers={typingUsernames}
                  isActive={conv.id === activeConversationId}
                  onClick={() => handleClick(conv)}
                />
              );
            })}

        {!isLoading && visible.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No conversations yet
          </p>
        )}
      </div>

      <Button
        size="icon"
        className="absolute bottom-6 right-6 shadow-lg"
        onClick={() => setDialogOpen(true)}
        aria-label="New conversation"
      >
        <Plus />
      </Button>

      <NewConversationDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
