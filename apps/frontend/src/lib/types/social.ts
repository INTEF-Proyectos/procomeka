/** Comment author summary for display in comment lists */
export interface CommentAuthor {
  id: string;
  name: string;
  avatarUrl?: string;
}

/** Moderation status for user-generated content */
export type ModerationStatus = "visible" | "pending" | "hidden" | "reported";

/** A single comment on a resource */
export interface Comment {
  id: string;
  resourceId: string;
  userId: string;
  parentId?: string | null;
  body: string;
  status: ModerationStatus;
  author: CommentAuthor;
  usefulCount: number;
  userVotedUseful?: boolean;
  replies?: Comment[];
  createdAt: string;
  updatedAt: string;
}

/** A top-level comment with its direct replies */
export interface CommentThread {
  comment: Comment;
  replies: Comment[];
}

/** Aggregate rating summary for a resource */
export interface RatingSummary {
  resourceId: string;
  averageScore: number;
  totalRatings: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
}

/** A single user's rating of a resource */
export interface UserRating {
  resourceId: string;
  userId: string;
  score: number;
  createdAt: string;
}

/** A user's favorite/bookmark of a resource */
export interface Favorite {
  resourceId: string;
  userId: string;
  createdAt: string;
}

/** Engagement signal type — "useful" chosen over upvote/downvote
 *  as it fits educational content better (signals pedagogical value) */
export type VoteType = "useful";

/** A vote on a comment */
export interface CommentVote {
  commentId: string;
  userId: string;
  voteType: VoteType;
  createdAt: string;
}
