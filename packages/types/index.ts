export interface User {
  id: string;
  email: string;
  is_admin: boolean;
  created_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  avatar_url?: string;
  bio?: string;
  skills: string[];
  github_url?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  level: number;
  xp: number;
  coins: number;
  streak_days: number;
}

export interface Lesson {
  id: string;
  title: string;
  slug: string;
  chapter_id: string;
  order: number;
  video_url?: string;
  notes_markdown: string;
  interactive_slides: any[];
  starter_code: string;
  quiz_questions: QuizQuestion[];
  mini_challenge: string;
  assignment_markdown: string;
  hints: string[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_option_index: number;
  explanation: string;
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  avatar_url?: string;
  xp: number;
  level: number;
}

export interface SavedCode {
  id: string;
  user_id: string;
  lesson_id: string;
  code: string;
  updated_at: string;
}
