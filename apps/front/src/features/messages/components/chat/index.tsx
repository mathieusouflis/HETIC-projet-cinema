import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/stores/auth.store";
import { queryConversationService } from "@/lib/api/services/conversations";
import { queryMessageService } from "@/lib/api/services/messages";
import { useMessagesSocket } from "../../hooks/use-messages-socket";
import { useTyping } from "../../hooks/use-typing";
import { useTypingStore } from "../../stores/typing.store";
import { MessageInput } from "./message-input";
import { MessageList } from "./message-list";

interface ChatPanelProps {
  conversationId: string;
}

export function ChatPanel({ conversationId }: ChatPanelProps) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    data: conversation,
    isLoading: isConvLoading,
    isError: isConvError,
    refetch: refetchConv,
  } = queryConversationService.get(conversationId);

  const otherParticipantId = conversation?.otherParticipant.id;
  const otherIsTyping = useTypingStore((s) => {
    if (!otherParticipantId) return false;
    return (s.typingByConversation[conversationId] ?? []).includes(
      otherParticipantId
    );
  });

  const markRead = queryConversationService.markRead();

  const { cleanupRef } = useMessagesSocket(conversationId);

  useEffect(() => () => cleanupRef.current(), []);

  useEffect(() => {
    markRead.mutate(conversationId);
  }, [conversationId]);

  const { emitTyping } = useTyping(conversationId);

  const { data, hasPreviousPage, isFetchingPreviousPage, fetchPreviousPage } =
    queryMessageService.infiniteList(conversationId);

  const sendMutation = queryMessageService.send(conversationId);
  const editMutation = queryMessageService.edit();
  const deleteMutation = queryMessageService.delete();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [failedContent, setFailedContent] = useState<string | null>(null);

  // Reset transient UI state when switching conversations
  useEffect(() => {
    setEditingId(null);
    setFailedContent(null);
  }, [conversationId]);

  const handleSend = (content: string) => {
    if (editingId) {
      editMutation.mutate(
        { messageId: editingId, content },
        { onSuccess: () => setEditingId(null) }
      );
    } else {
      setFailedContent(null);
      sendMutation.mutate(content, {
        onError: () => setFailedContent(content),
      });
    }
  };

  const handleRetry = () => {
    const content = failedContent;
    if (!content) return;
    setFailedContent(null);
    sendMutation.mutate(content, {
      onError: () => setFailedContent(content),
    });
  };

  const pages = data?.pages ?? [];
  const otherParticipant = conversation?.otherParticipant;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 border-b px-4 py-3 shrink-0">
        <Button
          variant="ghost"
          size="icon-sm"
          className="lg:hidden shrink-0"
          onClick={() => navigate({ to: "/messages" })}
          aria-label="Back"
        >
          <ArrowLeft />
        </Button>

        {isConvLoading && (
          <>
            <div className="size-8 shrink-0 rounded-full bg-muted animate-pulse" />
            <div className="h-4 w-32 rounded bg-muted animate-pulse" />
          </>
        )}

        {isConvError && (
          <div className="flex items-center gap-2 min-w-0">
            <p className="text-sm text-muted-foreground">
              Failed to load conversation
            </p>
            <Button variant="ghost" size="sm" onClick={() => refetchConv()}>
              Retry
            </Button>
          </div>
        )}

        {otherParticipant && (
          <>
            <Avatar size="sm">
              {otherParticipant.avatarUrl && (
                <AvatarImage
                  src={otherParticipant.avatarUrl}
                  alt={otherParticipant.username}
                />
              )}
              <AvatarFallback>
                {otherParticipant.username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="font-semibold text-sm truncate">
                {otherParticipant.username}
              </p>
              {otherIsTyping && (
                <p className="text-xs text-muted-foreground italic">writing…</p>
              )}
            </div>
          </>
        )}
      </div>

      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        {otherParticipant && (
          <MessageList
            pages={pages}
            currentUserId={user?.id ?? ""}
            otherParticipant={otherParticipant}
            hasNextPage={hasPreviousPage}
            isFetchingNextPage={isFetchingPreviousPage}
            onFetchNextPage={fetchPreviousPage}
            onEdit={(id) => setEditingId(id)}
            onDelete={(id) => deleteMutation.mutate(id)}
          />
        )}
      </div>

      <MessageInput
        onSend={handleSend}
        onTyping={emitTyping}
        disabled={editMutation.isPending || sendMutation.isPending}
        sendError={failedContent ? "Failed to send. Tap to retry." : null}
        onRetry={handleRetry}
      />
    </div>
  );
}
