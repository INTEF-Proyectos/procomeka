import { useState, type FormEvent } from "react";
import type { Comment, CommentThread } from "../lib/types/social.ts";
import { CommentItem } from "./CommentItem.tsx";
import "./CommentList.css";

export interface CommentListProps {
  threads: CommentThread[];
  currentUserId?: string | null;
  onVoteUseful?: (commentId: string) => Promise<void> | void;
  onReply?: (parentId: string, body: string) => Promise<void> | void;
  onEdit?: (commentId: string) => void;
  onDelete?: (commentId: string) => void;
  onPost?: (body: string) => Promise<void> | void;
  loading?: boolean;
  className?: string;
}

export function CommentList({
  threads,
  currentUserId,
  onVoteUseful,
  onReply,
  onEdit,
  onDelete,
  onPost,
  loading = false,
  className = "",
}: CommentListProps) {
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handlePost(e: FormEvent) {
    e.preventDefault();
    if (!onPost || !newComment.trim() || submitting) return;
    setSubmitting(true);
    try {
      await onPost(newComment.trim());
      setNewComment("");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReply(parentId: string) {
    if (!onReply || !replyBody.trim() || submitting) return;
    setSubmitting(true);
    try {
      await onReply(parentId, replyBody.trim());
      setReplyBody("");
      setReplyingTo(null);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className={`comment-list ${className}`.trim()} aria-label="Comentarios">
      <h3 className="comment-list-title">
        Opiniones de la comunidad
        <span className="comment-list-count">({threads.length})</span>
      </h3>

      {onPost && currentUserId && (
        <form className="comment-list-form" onSubmit={handlePost}>
          <textarea
            className="comment-list-textarea"
            placeholder="Comparte tu opinión sobre este recurso..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
            aria-label="Nuevo comentario"
            disabled={submitting}
          />
          <button
            type="submit"
            className="comment-list-submit"
            disabled={!newComment.trim() || submitting}
          >
            {submitting ? "Publicando..." : "Publicar comentario"}
          </button>
        </form>
      )}

      {loading && (
        <div className="comment-list-loading" aria-live="polite">
          <p>Cargando comentarios...</p>
        </div>
      )}

      {!loading && threads.length === 0 && (
        <div className="comment-list-empty" role="status">
          <span className="material-symbols-outlined" aria-hidden="true">forum</span>
          <p>Aún no hay comentarios. Sé el primero en opinar.</p>
        </div>
      )}

      {!loading && (
        <div className="comment-list-threads">
          {threads.map((thread) => (
            <div key={thread.comment.id} className="comment-thread">
              <CommentItem
                comment={thread.comment}
                onVoteUseful={onVoteUseful}
                onReply={onReply ? () => setReplyingTo(thread.comment.id) : undefined}
                onEdit={onEdit}
                onDelete={onDelete}
                isOwner={currentUserId === thread.comment.userId}
              />

              {thread.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  onVoteUseful={onVoteUseful}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  isOwner={currentUserId === reply.userId}
                  depth={1}
                />
              ))}

              {replyingTo === thread.comment.id && (
                <div className="comment-reply-form">
                  <textarea
                    className="comment-list-textarea comment-reply-textarea"
                    placeholder={`Responder a ${thread.comment.author.name}...`}
                    value={replyBody}
                    onChange={(e) => setReplyBody(e.target.value)}
                    rows={2}
                    aria-label={`Responder a ${thread.comment.author.name}`}
                    disabled={submitting}
                    autoFocus
                  />
                  <div className="comment-reply-actions">
                    <button
                      type="button"
                      className="comment-reply-cancel"
                      onClick={() => { setReplyingTo(null); setReplyBody(""); }}
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      className="comment-reply-submit"
                      disabled={!replyBody.trim() || submitting}
                      onClick={() => handleReply(thread.comment.id)}
                    >
                      Responder
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
