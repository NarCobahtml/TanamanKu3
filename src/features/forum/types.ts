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
  comments: { author: string; time: string; text: string; replyTo?: string }[];
};
