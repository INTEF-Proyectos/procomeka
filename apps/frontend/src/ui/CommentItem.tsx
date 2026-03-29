import { useState } from "react";
import type { Comment } from "../lib/types/social.ts";
import "./CommentItem.css";

export interface CommentItemProps {
  comment: Comment;
  onVoteUseful?: (commentId: string) => Promise<void> | void;
  onReply?: (commentId: string) => void;
  onEdit?: (commentId: string) => void;
  onDelete?: (commentId: string) => void;
  isOwner?: boolean;
  depth?: number;
  className?: string;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "ahora";
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `hace ${days}d`;
  return new Date(dateStr).toLocaleDateString("es-ES");
}

export function CommentItem({
  comment,
  onVoteUseful,
  onReply,
  onEdit,
  onDelete,
  isOwner = false,
  depth = 0,
  className = "",
}: CommentItemProps) {
  const [votingUseful, setVotingUseful] = useState(false);
  const isPending = comment.status === "pending";
  const isHidden = comment.status === "hidden" || comment.status === "reported";

  async function handleVoteUseful() {
    if (!onVoteUseful || votingUseful) return;
    setVotingUseful(true);
    try {
      await onVoteUseful(comment.id);
    } finally {
      setVotingUseful(false);
    }
  }

  if (isHidden && !isOwner) return null;

  return (
    <article
      className={`comment-item${depth > 0 ? " comment-item-reply" : ""} ${className}`.trim()}
      aria-label={`Comentario de ${comment.author.name}`}
    >
      <div className="comment-item-avatar">
        {comment.author.avatarUrl ? (
          <img src={comment.author.avatarUrl} alt="" className="comment-item-avatar-img" />
        ) : (
          <span className="material-symbols-outlined comment-item-avatar-placeholder" aria-hidden="true">person</span>
        )}
      </div>
      <div className="comment-item-content">
        <div className="comment-item-header">
          <span className="comment-item-author">{comment.author.name}</span>
          <time className="comment-item-time" dateTime={comment.createdAt}>
            {timeAgo(comment.createdAt)}
          </time>
          {isPending && <span className="comment-item-status-badge">Pendiente</span>}
          {isHidden && <span className="comment-item-status-badge comment-item-status-hidden">Oculto</span>}
        </div>
        <p className="comment-item-body">{comment.body}</p>
        <div className="comment-item-actions">
          <button
            type="button"
            className={`comment-action comment-action-useful${comment.userVotedUseful ? " comment-action-active" : ""}`}
            onClick={handleVoteUseful}
            disabled={votingUseful}
            aria-pressed={comment.userVotedUseful || false}
            aria-label={`Útil (${comment.usefulCount})`}
          >
            <span className="material-symbols-outlined" aria-hidden="true">thumb_up</span>
            <span>Útil{comment.usefulCount > 0 ? ` (${comment.usefulCount})` : ""}</span>
          </button>
          {onReply && (
            <button
              type="button"
              className="comment-action"
              onClick={() => onReply(comment.id)}
            >
              <span className="material-symbols-outlined" aria-hidden="true">reply</span>
              <span>Responder</span>
            </button>
          )}
          {isOwner && onEdit && (
            <button
              type="button"
              className="comment-action"
              onClick={() => onEdit(comment.id)}
            >
              <span className="material-symbols-outlined" aria-hidden="true">edit</span>
              <span>Editar</span>
            </button>
          )}
          {isOwner && onDelete && (
            <button
              type="button"
              className="comment-action comment-action-danger"
              onClick={() => onDelete(comment.id)}
            >
              <span className="material-symbols-outlined" aria-hidden="true">delete</span>
              <span>Eliminar</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
