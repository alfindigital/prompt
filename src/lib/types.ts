export interface Prompt {
  id: string;
  title: string;
  content: string;
  tags: string[];
  is_favorite: boolean;
  created_at: string;
  last_used_at: string | null;
}
