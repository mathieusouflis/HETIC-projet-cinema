import { useQueryClient } from "@tanstack/react-query";
import { Outlet, useParams } from "@tanstack/react-router";
import { MessageSquareDashed } from "lucide-react";
import { useEffect, useRef } from "react";
import { useAuth } from "@/features/auth/stores/auth.store";
import { queryConversationService } from "@/lib/api/services/conversations";
import { conversationKeys } from "@/lib/api/services/conversations/keys";
import type { MessageDTO } from "@/lib/socket";
import { getSocket } from "@/lib/socket";
import type { Conversation } from "../types";
import { ConversationList } from "./conversation-list";

function EmptyPanel() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
      <MessageSquareDashed className="size-12 opacity-30" />
      <p className="text-sm">Select a conversation to start chatting</p>
    </div>
  );
}

export function MessagesLayout() {
  const { conversationId } = useParams({ strict: false }) as {
    conversationId?: string;
  };

  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { data: conversations } = queryConversationService.list();

  const activeConvIdRef = useRef(conversationId);
  activeConvIdRef.current = conversationId;

  const queryClientRef = useRef(queryClient);
  queryClientRef.current = queryClient;

  const userIdRef = useRef(user?.id);
  userIdRef.current = user?.id;

  useEffect(() => {
    getSocket();
  }, []);

  const joinedRoomsRef = useRef(new Set<string>());
  useEffect(() => {
    if (!conversations?.length) return;
    const socket = getSocket();
    for (const conv of conversations) {
      if (!joinedRoomsRef.current.has(conv.id)) {
        socket.emit("conversation:join", { conversationId: conv.id });
        joinedRoomsRef.current.add(conv.id);
      }
    }
  }, [conversations]);

  useEffect(() => {
    const socket = getSocket();

    const onNew = (dto: MessageDTO) => {
      if (dto.conversationId === activeConvIdRef.current) return;

      const userId = userIdRef.current;
      if (!userId) return;

      queryClientRef.current.setQueryData<Conversation[]>(
        conversationKeys.all(userId),
        (old) => {
          if (!old) return old;
          const updated = old.map((c) =>
            c.id === dto.conversationId
              ? {
                  ...c,
                  unreadCount: c.unreadCount + 1,
                  lastMessage: {
                    id: dto.id,
                    content: dto.content,
                    isDeleted: dto.isDeleted,
                    createdAt: dto.createdAt,
                    authorId: dto.userId,
                  },
                }
              : c
          );
          return [...updated].sort((a, b) => {
            const ta = a.lastMessage?.createdAt ?? a.createdAt ?? "";
            const tb = b.lastMessage?.createdAt ?? b.createdAt ?? "";
            return tb.localeCompare(ta);
          });
        }
      );
    };

    socket.on("message:new", onNew);
    return () => {
      socket.off("message:new", onNew);
    };
  }, []);

  return (
    <div className="-my-5 -mx-5 lg:-ml-0 h-dvh flex overflow-hidden">
      <div
        className={`${
          conversationId ? "hidden lg:flex" : "flex"
        } flex-col w-full lg:w-[360px] shrink-0`}
      >
        <ConversationList activeConversationId={conversationId} />
      </div>

      <div
        className={`${
          conversationId ? "flex" : "hidden lg:flex"
        } flex-col flex-1 overflow-hidden`}
      >
        {conversationId ? <Outlet /> : <EmptyPanel />}
      </div>
    </div>
  );
}
