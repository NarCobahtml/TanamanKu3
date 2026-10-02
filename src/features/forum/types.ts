export interface ForumComment {
  id?: string;
  authorId?: string;
  author: string;
  avatar?: string;
  time: string;
  text: string;
  replyTo?: string;
  parentId?: string;
  replies?: ForumComment[];
}

export type ForumPost = {
  id: string;
  authorId?: string;
  author: string;
  initials: string;
  avatar?: string;
  expert?: boolean;
  time: string;
  category: string;
  title: string;
  excerpt: string;
  content?: string[];
  image?: string;
  likes: number;
  views: number;
  comments: ForumComment[];
  tags?: string[];
};
