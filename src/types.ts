export interface World {
  id: string;
  title: string;
  genre: string;
  description: string;
  max_players: number;
  current_players: number;
  status: 'preparation' | 'active' | 'locked' | 'finished';
  phase: 'setup' | 'conflict' | 'crisis' | 'climax' | 'epilog';
  admin_id: string;
  rules: string;
  created_at: string;
}

export interface User {
  id: string;
  username: string;
}

export interface Player {
  id: string;
  world_id: string;
  user_id: string;
  role_name: string;
  role_description: string;
  role_alignment: string;
  is_admin: boolean;
  joined_at: string;
}

export interface Message {
  id: string;
  world_id: string;
  sender_id: string | null;
  content: string;
  emotion: 'angry' | 'afraid' | 'calm' | 'suspicious' | 'sad' | null;
  type: 'chat' | 'system' | 'admin' | 'secret';
  created_at: string;
}

export interface Secret {
  id: string;
  world_id: string;
  target_role: string | null;
  content: string;
  is_revealed: boolean;
  created_at: string;
}
