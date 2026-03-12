// src/constants/data.ts

export interface Player {
  id: string;
  name: string;
  streak: number;
  score: number;
  initials: string;
  color: string;
  bgColor: string;
  borderColor: string;
  subtext?: string; // Kasutame seda edetabeli detailvaates
}

export const TOP_PLAYERS: Player[] = [
  { 
    id: '1', 
    name: 'Emma', 
    streak: 25, 
    score: 520, 
    initials: 'E', 
    color: '#8B5CF6', 
    bgColor: '#FFFBEB', 
    borderColor: '#FDE68A',
    subtext: 'Solved in 2 guesses'
  },
  { 
    id: '2', 
    name: 'Sarah', 
    streak: 12, 
    score: 450, 
    initials: 'S', 
    color: '#6366F1', 
    bgColor: '#F1F5F9', 
    borderColor: '#CBD5E1',
    subtext: 'Solved in 3 guesses'
  },
  { 
    id: '3', 
    name: 'Mike', 
    streak: 8, 
    score: 380, 
    initials: 'M', 
    color: '#A855F7', 
    bgColor: '#FFF7ED', 
    borderColor: '#FFEDD5',
    subtext: 'Solved in 4 guesses'
  },
  { 
    id: '4', 
    name: 'Olivia', 
    streak: 18, 
    score: 490, 
    initials: 'O', 
    color: '#EC4899', 
    bgColor: '#F1F5F9', 
    borderColor: '#E2E8F0',
    subtext: 'Solved in 3 guesses'
  },
  { 
    id: '5', 
    name: 'Alex', 
    streak: 5, 
    score: 310, 
    initials: 'A', 
    color: '#10B981', 
    bgColor: '#F1F5F9', 
    borderColor: '#E2E8F0',
    subtext: 'Solved in 5 guesses'
  },
];