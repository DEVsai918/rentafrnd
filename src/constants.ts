import { Companion, MoodOption, ActivityOption } from './types';

export const MOODS: MoodOption[] = [
  { id: 'Lonely', label: 'Lonely', emoji: '😶', description: 'Seeking a warm presence' },
  { id: 'Explore', label: 'Explore', emoji: '🌍', description: 'Adventurous and curious' },
  { id: 'Party', label: 'Party', emoji: '🎉', description: 'High energy and social' },
  { id: 'Chill', label: 'Chill', emoji: '☕', description: 'Relaxed and low-key' },
];

export const ACTIVITIES: ActivityOption[] = [
  { id: 'dining', label: 'Dining', icon: 'Utensils', price: 1500, image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800' },
  { id: 'travel', label: 'Travel', icon: 'Map', price: 3500, image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80&w=800' },
  { id: 'events', label: 'Events', icon: 'Ticket', price: 2000, image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800' },
  { id: 'park', label: 'Park', icon: 'Trees', price: 500, image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=800' },
  { id: 'gym', label: 'Gym', icon: 'Dumbbell', price: 800, image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800' },
  { id: 'movies', label: 'Movies', icon: 'Film', price: 1200, image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=800' },
  { id: 'beach', label: 'Beach', icon: 'Palmtree', price: 1800, image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800' },
  { id: 'nightlife', label: 'Nightlife', icon: 'Music', price: 2500, image: 'https://images.unsplash.com/photo-1514525253361-bee8718a340b?auto=format&fit=crop&q=80&w=800' },
  { id: 'mindfulness', label: 'Mindfulness', icon: 'Flower2', price: 1000, image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=800' },
  { id: 'voice', label: 'Voice Call', icon: 'Phone', price: 499, image: 'https://images.unsplash.com/photo-1520923642038-b4259ace9439?auto=format&fit=crop&q=80&w=800' },
  { id: 'video', label: 'Video Call', icon: 'Video', price: 999, image: 'https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?auto=format&fit=crop&q=80&w=800' },
  { id: 'chat-service', label: 'Emotional Chat', icon: 'HeartHandshake', price: 199, image: 'https://images.unsplash.com/photo-1516534775068-ba3e7458af70?auto=format&fit=crop&q=80&w=800', unit: 'session' },
];

export const INTERESTS = [
  'Foodie', 'Music', 'Travel', 'Art', 'Tech', 'Fitness', 'Movies', 'Nature', 'Dance', 'Books', 'Gaming', 'Photography'
];

export const VIBES = [
  'Fun', 'Chill', 'Talkative', 'Quiet', 'Energetic', 'Deep Talker', 'Listener', 'Adventurous'
];

export const MOCK_COMPANIONS: Companion[] = [
  {
    id: '1',
    name: 'Ananya',
    age: 24,
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400',
    vibe: 'Fun, talkative, loves travel and street food.',
    availability: 'Available now',
    rating: 4.9,
    verified: true,
    suggestedActivity: 'Dining',
    location: 'Hyderabad',
    tags: ['Foodie', 'Talkative', 'Explorer'],
    bio: 'Professional foodie and travel enthusiast. I love exploring hidden gems in the city.',
    responseTime: '5 mins',
    lastActive: '2 mins ago',
    responseRate: 98,
    completedSessions: 142
  },
  {
    id: '2',
    name: 'Rahul',
    age: 27,
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
    vibe: 'Chill, music lover, great listener.',
    availability: 'Available now',
    rating: 4.8,
    verified: true,
    suggestedActivity: 'Chill',
    location: 'Bangalore',
    tags: ['Music', 'Listener', 'Coffee'],
    bio: 'Music producer and a great listener. Let\'s grab a coffee and talk about life.',
    responseTime: '10 mins',
    lastActive: '5 mins ago',
    responseRate: 95,
    completedSessions: 89
  },
  {
    id: '3',
    name: 'Priya',
    age: 25,
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
    vibe: 'Energetic, party enthusiast, loves dancing.',
    availability: 'Available now',
    rating: 4.7,
    verified: true,
    suggestedActivity: 'Nightlife',
    location: 'Chennai',
    tags: ['Dance', 'Party', 'High Energy'],
    bio: 'Life of the party! I love dancing and meeting new people. Let\'s have some fun!',
    responseTime: '3 mins',
    lastActive: '1 min ago',
    responseRate: 99,
    completedSessions: 210
  },
  {
    id: '4',
    name: 'Vikram',
    age: 29,
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
    vibe: 'Nature lover, trekking expert, quiet but friendly.',
    availability: 'Available now',
    rating: 4.9,
    verified: true,
    suggestedActivity: 'Park',
    location: 'Bangalore',
    tags: ['Nature', 'Trekking', 'Quiet'],
    bio: 'Nature lover and trekking expert. I enjoy quiet walks and meaningful conversations.',
    responseTime: '15 mins',
    lastActive: '10 mins ago',
    responseRate: 92,
    completedSessions: 65
  },
  {
    id: '5',
    name: 'Sanya',
    age: 23,
    photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400',
    vibe: 'Cinephile, loves deep conversations about art.',
    availability: 'Available now',
    rating: 4.6,
    verified: true,
    suggestedActivity: 'Movies',
    location: 'Hyderabad',
    tags: ['Art', 'Movies', 'Deep Talk'],
    bio: 'Cinephile and art lover. I enjoy deep conversations about movies and culture.',
    responseTime: '8 mins',
    lastActive: '4 mins ago',
    responseRate: 96,
    completedSessions: 112
  }
];
