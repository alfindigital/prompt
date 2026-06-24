export interface PromptRevision {
  title: string;
  content: string;
  tags: string[];
  category: string | null;
  saved_at: string;
}

export interface Prompt {
  id: string;
  title: string;
  content: string;
  tags: string[];
  category: string | null;
  is_favorite: boolean;
  created_at: string;
  updated_at?: string;
  last_used_at: string | null;
  use_count?: number;
  sort_order?: number;
  history?: PromptRevision[];
}

export interface Category {
  id: string;
  name: string;
  color: string;
  parent_id?: string | null;
}
