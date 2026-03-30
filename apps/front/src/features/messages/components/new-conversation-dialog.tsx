import { gETUsersId } from "@packages/api-sdk";
import { useQueries } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/features/auth/stores/auth.store";
import { queryConversationService } from "@/lib/api/services/conversations";
import { queryFriendshipService } from "@/lib/api/services/friendships";

interface NewConversationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ResolvedFriend {
  friendshipId: string;
  otherId: string;
  username: string;
  avatarUrl: string | null;
}

export function NewConversationDialog({
  open,
  onOpenChange,
}: NewConversationDialogProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const createConv = queryConversationService.create();

  const { data: friendships = [] } = queryFriendshipService.list("accepted");

  const otherIds = friendships.map((f) =>
    f.userId === user?.id ? f.friendId : f.userId
  );

  const userQueries = useQueries({
    queries: otherIds.map((otherId) => ({
      queryKey: ["users", "get", otherId],
      queryFn: async () => {
        const res = await gETUsersId(otherId);
        return res.data.data;
      },
      enabled: open && !!otherId,
      staleTime: 5 * 60 * 1000, // 5 min — user profiles change rarely
    })),
  });

  const resolvedFriends: ResolvedFriend[] = friendships.flatMap((f, i) => {
    const result = userQueries[i];
    if (!result?.data) {
      return [];
    }
    const otherId = otherIds[i];
    if (!otherId) {
      return [];
    }
    return [
      {
        friendshipId: f.id,
        otherId,
        username: result.data.username,
        avatarUrl: result.data.avatarUrl ?? null,
      },
    ];
  });

  const isLoadingAny = userQueries.some((q) => q.isLoading);

  const visible = search
    ? resolvedFriends.filter((f) =>
        f.username.toLowerCase().includes(search.toLowerCase())
      )
    : resolvedFriends;

  const handleSelect = (otherId: string) => {
    createConv.mutate(otherId, {
      onSuccess: ({ id }) => {
        onOpenChange(false);
        navigate({
          to: "/messages/$conversationId",
          params: { conversationId: id },
        });
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>New Conversation</DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search friends…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border bg-muted/30 pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {createConv.isError && (
          <p className="text-xs text-destructive text-center py-1">
            Failed to start conversation. Please try again.
          </p>
        )}

        <div className="max-h-64 overflow-y-auto -mx-2">
          {/* Loading skeletons — shown while user profiles are being fetched */}
          {isLoadingAny &&
            resolvedFriends.length === 0 &&
            friendships.length > 0 &&
            Array.from({ length: Math.min(friendships.length, 4) }).map(
              (_, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3">
                  <div className="size-8 shrink-0 rounded-full bg-muted animate-pulse" />
                  <div className="h-4 w-32 rounded bg-muted animate-pulse" />
                </div>
              )
            )}

          {/* Empty state — no friends at all */}
          {!isLoadingAny && friendships.length === 0 && (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No friends yet — add some from the Community page!
            </p>
          )}

          {/* Empty search result */}
          {!isLoadingAny &&
            friendships.length > 0 &&
            visible.length === 0 &&
            search && (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No friends match &ldquo;{search}&rdquo;
              </p>
            )}

          {visible.map((friend) => (
            <Button
              key={friend.friendshipId}
              variant="ghost"
              className="w-full justify-start gap-3 px-4 py-3 h-auto"
              onClick={() => handleSelect(friend.otherId)}
              disabled={createConv.isPending}
            >
              <Avatar size="sm">
                {friend.avatarUrl && (
                  <AvatarImage src={friend.avatarUrl} alt={friend.username} />
                )}
                <AvatarFallback>
                  {friend.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium">{friend.username}</span>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
