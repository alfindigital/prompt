export interface Prompt {
  id: string;
  title: string;
  content: string;
  tags: string[];
  category: string | null;
  is_favorite: boolean;
  created_at: string;
  last_used_at: string | null;
  sort_order?: number;
}

export interface Category {
  id: string;
  name: string;
  color: string;
}
