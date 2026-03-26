import { gETUsers, gETUsersId } from "@packages/api-sdk";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  Check,
  MessageSquare,
  Search,
  UserCheck,
  UserPlus,
  X,
} from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/stores/auth.store";
import { queryConversationService } from "@/lib/api/services/conversations";
import {
  type Friendship,
  queryFriendshipService,
} from "@/lib/api/services/friendships";

function useUserProfile(userId: string) {
  return useQuery({
    queryKey: ["users", "get", userId],
    queryFn: async () => {
      const res = await gETUsersId(userId);
      return res.data.data;
    },
    enabled: !!userId,
  });
}

function RowSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="size-10 shrink-0 rounded-full bg-muted animate-pulse" />
      <div className="h-4 w-32 rounded bg-muted animate-pulse" />
    </div>
  );
}

function FriendRow({
  friendship,
  currentUserId,
}: {
  friendship: Friendship;
  currentUserId: string;
}) {
  const navigate = useNavigate();
  const otherId =
    friendship.userId === currentUserId
      ? friendship.friendId
      : friendship.userId;
  const { data: user, isLoading } = useUserProfile(otherId);
  const remove = queryFriendshipService.remove();
  const createConv = queryConversationService.create();

  const handleMessage = () => {
    createConv.mutate(otherId, {
      onSuccess: ({ id }) =>
        navigate({
          to: "/messages/$conversationId",
          params: { conversationId: id },
        }),
    });
  };

  if (isLoading || !user) return <RowSkeleton />;

  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50">
      <Avatar>
        {user.avatarUrl && (
          <AvatarImage src={user.avatarUrl} alt={user.username} />
        )}
        <AvatarFallback>
          {user.username.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <span className="flex-1 font-medium truncate">{user.username}</span>
      <Button
        size="icon"
        variant="ghost"
        className="shrink-0"
        onClick={handleMessage}
        disabled={createConv.isPending}
        title="Send message"
      >
        <MessageSquare className="size-4" />
      </Button>
      <Button
        size="icon"
        variant="ghost"
        className="shrink-0 text-destructive hover:text-destructive"
        onClick={() => remove.mutate(friendship.id)}
        title="Remove friend"
        disabled={remove.isPending}
      >
        <X className="size-4" />
      </Button>
    </div>
  );
}

function RequestRow({
  friendship,
  currentUserId,
}: {
  friendship: Friendship;
  currentUserId: string;
}) {
  const isIncoming = friendship.friendId === currentUserId;
  const otherUserId = isIncoming ? friendship.userId : friendship.friendId;
  const { data: user, isLoading } = useUserProfile(otherUserId);
  const respond = queryFriendshipService.respond();
  const remove = queryFriendshipService.remove();

  if (isLoading || !user) return <RowSkeleton />;

  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50">
      <Avatar>
        {user.avatarUrl && (
          <AvatarImage src={user.avatarUrl} alt={user.username} />
        )}
        <AvatarFallback>
          {user.username.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{user.username}</p>
        <p className="text-xs text-muted-foreground">
          {isIncoming ? "Wants to be your friend" : "Request pending"}
        </p>
      </div>
      {isIncoming ? (
        <div className="flex gap-1 shrink-0">
          <Button
            size="icon"
            onClick={() =>
              respond.mutate({ id: friendship.id, status: "accepted" })
            }
            disabled={respond.isPending}
            title="Accept"
          >
            <Check className="size-4" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            onClick={() =>
              respond.mutate({ id: friendship.id, status: "rejected" })
            }
            disabled={respond.isPending}
            title="Reject"
          >
            <X className="size-4" />
          </Button>
        </div>
      ) : (
        <Button
          size="sm"
          variant="outline"
          className="shrink-0"
          onClick={() => remove.mutate(friendship.id)}
          disabled={remove.isPending}
        >
          Cancel
        </Button>
      )}
    </div>
  );
}

function DiscoverRow({
  userId,
  username,
  avatarUrl,
  friendship,
}: {
  userId: string;
  username: string;
  avatarUrl: string | null | undefined;
  friendship: Friendship | undefined;
}) {
  const send = queryFriendshipService.send();
  const remove = queryFriendshipService.remove();

  const isPending = friendship?.status === "pending";
  const isAccepted = friendship?.status === "accepted";

  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50">
      <Avatar>
        {avatarUrl && <AvatarImage src={avatarUrl} alt={username} />}
        <AvatarFallback>{username.slice(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>
      <span className="flex-1 font-medium truncate">{username}</span>
      {isAccepted ? (
        <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 shrink-0">
          <UserCheck className="size-4" /> Friends
        </span>
      ) : isPending ? (
        <Button
          size="sm"
          variant="outline"
          className="shrink-0"
          onClick={() => friendship && remove.mutate(friendship.id)}
          disabled={remove.isPending}
        >
          Pending
        </Button>
      ) : (
        <Button
          size="icon"
          variant="outline"
          className="shrink-0"
          onClick={() => send.mutate(userId)}
          disabled={send.isPending}
          title="Add friend"
        >
          <UserPlus className="size-4" />
        </Button>
      )}
    </div>
  );
}

type Tab = "friends" | "requests" | "discover";

export function CommunityPage() {
  const [tab, setTab] = useState<Tab>("friends");
  const [search, setSearch] = useState("");
  const { user } = useAuth();
  const currentUserId = user?.id ?? "";

  const { data: acceptedFriends = [] } =
    queryFriendshipService.list("accepted");
  const { data: pendingFriendships = [] } =
    queryFriendshipService.list("pending");
  const { data: allFriendships = [] } = queryFriendshipService.list();

  const incomingCount = pendingFriendships.filter(
    (f) => f.friendId === currentUserId
  ).length;

  const { data: usersData } = useQuery({
    queryKey: ["users", "list"],
    queryFn: async () => {
      const res = await gETUsers({ limit: 50 });
      return res.data.data.users;
    },
    enabled: tab === "discover",
  });

  const filteredUsers = (usersData ?? []).filter(
    (u) =>
      u.id !== currentUserId &&
      u.username.toLowerCase().includes(search.toLowerCase())
  );

  const tabs: { key: Tab; label: string; badge?: number }[] = [
    { key: "friends", label: "Friends" },
    { key: "requests", label: "Requests", badge: incomingCount || undefined },
    { key: "discover", label: "Discover" },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="shrink-0 px-4 pt-6 pb-2 space-y-4 border-b">
        <h1 className="text-xl font-bold">Community</h1>

        {/* Tab bar */}
        <div className="flex gap-1">
          {tabs.map(({ key, label, badge }) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                setTab(key);
                setSearch("");
              }}
              className={`relative rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                tab === key
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {label}
              {badge && badge > 0 ? (
                <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                  {badge}
                </span>
              ) : null}
            </button>
          ))}
        </div>

        {/* Search (Discover tab only) */}
        {tab === "discover" && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search users…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-full border bg-muted/30 pl-9 pr-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {tab === "friends" &&
          (acceptedFriends.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              No friends yet — discover people in the Discover tab!
            </p>
          ) : (
            acceptedFriends.map((f) => (
              <FriendRow
                key={f.id}
                friendship={f}
                currentUserId={currentUserId}
              />
            ))
          ))}

        {tab === "requests" &&
          (pendingFriendships.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              No pending requests
            </p>
          ) : (
            pendingFriendships.map((f) => (
              <RequestRow
                key={f.id}
                friendship={f}
                currentUserId={currentUserId}
              />
            ))
          ))}

        {tab === "discover" &&
          (filteredUsers.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              {search ? "No users found" : "Loading users…"}
            </p>
          ) : (
            filteredUsers.map((u) => {
              const friendship = allFriendships.find(
                (f) => f.userId === u.id || f.friendId === u.id
              );
              return (
                <DiscoverRow
                  key={u.id}
                  userId={u.id}
                  username={u.username}
                  avatarUrl={u.avatarUrl}
                  friendship={friendship}
                />
              );
            })
          ))}
      </div>
    </div>
  );
}
