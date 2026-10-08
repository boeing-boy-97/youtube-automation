export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
  plan: Plan;
}

export type Plan = 'starter' | 'creator' | 'pro';

export interface Session {
  user: User;
  token: string;
}
