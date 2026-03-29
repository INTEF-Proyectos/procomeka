import { useEffect, useState } from "react";
import type { Comment, CommentThread } from "../../lib/types/social.ts";
import { CommentList } from "../../ui/CommentList.tsx";
import { getApiClient } from "../../lib/get-api-client.ts";

export interface CommentSectionIslandProps {
  resourceSlug: string;
  currentUserId?: string | null;
}

/** Normalize API comment (flat userName) into the shape CommentItem expects (author object) */
function normalizeComment(raw: Record<string, unknown>): Comment {
  return {
    id: raw.id as string,
    resourceId: raw.resourceId as string,
    userId: raw.userId as string,
    parentId: (raw.parentId as string) || null,
    body: raw.body as string,
    status: (raw.status as string) || "visible",
    author: {
      id: raw.userId as string,
      name: (raw.userName as string) || (raw.author as { name: string })?.name || "Anónimo",
      avatarUrl: (raw.author as { avatarUrl?: string })?.avatarUrl || undefined,
    },
    usefulCount: (raw.usefulCount as number) ?? 0,
    userVotedUseful: (raw.userVotedUseful as boolean) ?? false,
    createdAt: raw.createdAt as string,
    updatedAt: (raw.updatedAt as string) || (raw.createdAt as string),
  };
}

function normalizeThread(raw: Record<string, unknown>): CommentThread {
  const comment = normalizeComment((raw.comment ?? raw) as Record<string, unknown>);
  const replies = ((raw.replies as Record<string, unknown>[]) ?? []).map(normalizeComment);
  return { comment, replies };
}

export function CommentSectionIsland({ resourceSlug, currentUserId }: CommentSectionIslandProps) {
  const [threads, setThreads] = useState<CommentThread[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        const api = await getApiClient();
        const result = await api.getResourceComments(resourceSlug);
        setThreads((result.data as Record<string, unknown>[]).map(normalizeThread));
      } catch {
        // No comments
      } finally {
        setLoading(false);
      }
    })();
  }, [resourceSlug]);

  async function handlePost(body: string) {
    const api = await getApiClient();
    const raw = await api.createComment(resourceSlug, body);
    const comment = normalizeComment(raw as Record<string, unknown>);
    setThreads((prev) => [{ comment, replies: [] }, ...prev]);
  }

  async function handleReply(parentId: string, body: string) {
    const api = await getApiClient();
    const raw = await api.createComment(resourceSlug, body, parentId);
    const reply = normalizeComment(raw as Record<string, unknown>);
    setThreads((prev) =>
      prev.map((thread) =>
        thread.comment.id === parentId
          ? { ...thread, replies: [...thread.replies, reply] }
          : thread,
      ),
    );
  }

  return (
    <CommentList
      threads={threads}
      currentUserId={currentUserId}
      onPost={currentUserId ? handlePost : undefined}
      onReply={currentUserId ? handleReply : undefined}
      loading={loading}
    />
  );
}
