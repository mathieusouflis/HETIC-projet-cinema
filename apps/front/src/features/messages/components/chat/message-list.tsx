import { useLayoutEffect, useRef } from "react";
import type { Message, MessagePage, Participant } from "../../types";
import { MessageBubble } from "./message-bubble";

interface MessageListProps {
  pages: MessagePage[];
  currentUserId: string;
  otherParticipant: Participant;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onFetchNextPage: () => void;
  onEdit?: (messageId: string) => void;
}

/**
 * Scroll behaviour state machine
 *
 * "initial"       → waiting for the first batch of messages to appear in the
 *                   DOM; scroll to bottom as soon as they do.
 * "idle"          → normal state; auto-scroll to bottom only when the user is
 *                   already near the bottom (<= 100 px away).
 * "prepending"    → an older page is being loaded; restore scroll position so
 *                   the viewport does not jump.
 */
type ScrollMode = "initial" | "idle" | "prepending";

export function MessageList({
  pages,
  currentUserId,
  otherParticipant,
  hasNextPage,
  isFetchingNextPage,
  onFetchNextPage,
  onEdit,
}: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const scrollMode = useRef<ScrollMode>("initial");

  const prevScrollHeight = useRef(0);

  const allMessages: Message[] = pages.flatMap((p) => p.items);

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) {
      return;
    }

    switch (scrollMode.current) {
      case "initial": {
        if (allMessages.length === 0) {
          return;
        }
        el.scrollTop = el.scrollHeight;
        scrollMode.current = "idle";
        break;
      }

      case "prepending": {
        const diff = el.scrollHeight - prevScrollHeight.current;
        if (diff > 0) {
          el.scrollTop += diff;
        }
        prevScrollHeight.current = el.scrollHeight;
        scrollMode.current = "idle";
        break;
      }

      case "idle": {
        const distanceFromBottom =
          el.scrollHeight - el.scrollTop - el.clientHeight;
        if (distanceFromBottom <= 100) {
          el.scrollTop = el.scrollHeight;
        }
        prevScrollHeight.current = el.scrollHeight;
        break;
      }
    }
  }, [allMessages.length]);

  useLayoutEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasNextPage) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && !isFetchingNextPage) {
          const el = scrollRef.current;
          if (el) {
            prevScrollHeight.current = el.scrollHeight;
          }
          scrollMode.current = "prepending";
          onFetchNextPage();
        }
      },
      { root: scrollRef.current, threshold: 0.1 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, onFetchNextPage]);

  return (
    <div
      ref={scrollRef}
      className="flex flex-col overflow-x-hidden overflow-y-scroll"
    >
      <div className="flex flex-col px-4 py-2 gap-1">
        <div ref={sentinelRef} className="h-1 shrink-0" />

        {isFetchingNextPage && (
          <p className="text-center text-xs text-muted-foreground py-2">
            Loading…
          </p>
        )}

        {allMessages.map((message, i) => {
          const isOwn = message.userId === currentUserId;
          const prevMessage = allMessages[i - 1];
          const showAvatar =
            !isOwn && (i === 0 || prevMessage?.userId !== message.userId);

          return (
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={isOwn}
              showAvatar={showAvatar}
              sender={isOwn ? undefined : otherParticipant}
              onEdit={isOwn ? onEdit : undefined}
            />
          );
        })}
      </div>
    </div>
  );
}
