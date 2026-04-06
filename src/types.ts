import { LucideIcon } from 'lucide-react';

export type Mood = 'Lonely' | 'Explore' | 'Party' | 'Chill';

export interface MoodOption {
  id: Mood;
  label: string;
  emoji: string;
  description: string;
}

export interface ActivityOption {
  id: string;
  label: string;
  icon: string;
  price: number;
  image?: string;
  unit?: string;
}

export interface Companion {
  id: string;
  name: string;
  age: number;
  photo: string;
  vibe: string;
  availability: 'Available now' | 'Busy' | 'Available in 1h';
  rating: number;
  verified: boolean;
  suggestedActivity: string;
  location: string;
  tags: string[];
  bio: string;
  responseTime: string;
  lastActive: string;
  responseRate: number;
  completedSessions: number;
}

export interface UserPreferences {
  ageRange: [number, number];
  interests: string[];
  vibe: string[];
}

export type AppState = 'hero' | 'mood-selection' | 'activity-selection' | 'preferences' | 'matching' | 'results' | 'chat' | 'booking-service' | 'booking-reason' | 'booking-point' | 'booking-success' | 'payment' | 'terms' | 'privacy' | 'refund' | 'contact';
