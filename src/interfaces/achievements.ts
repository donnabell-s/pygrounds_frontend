export interface Achievement {
  id: string;
  name: string;
  description: string;
  progress: {
    current: number;
    target: number;
  };
  isUnlocked: boolean;
  icon?: string; // optional: URL or icon name for display
}


export const achievements: Achievement[] = [
  {
    id: "five-star-coder",
    name: "Five-Star Coder",
    description: "Complete 5 perfect rounds of any minigame (no mistakes, no hints).",
    progress: {
      current: 0,
      target: 5,
    },
    isUnlocked: false,
  },
  {
    id: "early-bird",
    name: "Early Bird",
    description: "Log in before 7:00 AM for 3 consecutive days.",
    progress: {
      current: 1,
      target: 3,
    },
    isUnlocked: false,
  },
  {
    id: "grammar-guardian",
    name: "Grammar Guardian",
    description: "Achieve 90% accuracy in grammar minigames across 10 sessions.",
    progress: {
      current: 7,
      target: 10,
    },
    isUnlocked: false,
  },
  {
    id: "master-of-loops",
    name: "Master of Loops",
    description: "Solve 20 loop-based Python challenges.",
    progress: {
      current: 20,
      target: 20,
    },
    isUnlocked: true,
  },
];
