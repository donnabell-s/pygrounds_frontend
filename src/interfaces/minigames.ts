export interface Minigame {
  title: string;
  description: string;
  category: string;
  instructions: (string | { text: string; substeps: string[] })[];
  tips: string[];
  is_initial: boolean;
  challenges: number;
  lives: number;
  time_limit_seconds: number | null;
}

export const mockGames: Minigame[] = [
  {
    title: "Hangman Coding Game",
    description:
      "Write Python code to solve challenges. Get it wrong 3 times and the mascot gets hung!",
    category: "Coding",
    instructions: [
      "You'll be given 3 to 5 coding prompts",
      {
        text: "Each prompt includes:",
        substeps: [
          "A description of the task",
          "A sample input and expected output",
        ],
      },
      "Write the correct Python code snippet to match the output",
      "Warning: Each wrong attempt costs a life. You have 3 strikes total!",
    ],
    tips: [
      "Read the sample input/output carefully for clues",
      "Use your 3 strikes wisely — double-check before submitting",
    ],
    is_initial: false,
    challenges: 3,
    lives: 3,
    time_limit_seconds: null,
  },
  {
    title: "Ship Debugging Game",
    description:
      "Debug malfunctioning ship systems before time runs out or the ship explodes!",
    category: "Coding",
    instructions: [
      "You are a ship engineer tasked with stabilizing failing systems.",
      "Each round, you'll see buggy Python code.",
      "Fix it correctly before time runs out to save the ship.",
      "Fail, and the mission is compromised!",
    ],
    tips: [
      "Watch for common syntax errors.",
      "Pay attention to variable scope and function logic.",
      "Don’t forget about indentation!",
    ],
    is_initial: false,
    challenges: 3,
    lives: 1,
    time_limit_seconds: 180,
  },
  {
    title: "Python Word Search",
    description:
      "Find Python terms and concepts hidden in dynamically generated word grids.",
    category: "Concept",
    instructions: [
      "Each round presents a question or clue.",
      "Find the corresponding Python term in the word grid.",
      "Only one clue is shown at a time.",
      "Find the correct word to unlock the next clue.",
    ],
    tips: [
      "Think about concept names, not full definitions.",
      "Avoid random guessing to prevent delays.",
    ],
    is_initial: false,
    challenges: 8,
    lives: 3,
    time_limit_seconds: null,
  },
  {
    title: "Python Crossword",
    description:
      "Complete crossword puzzles using Python terminology, functions, and concepts.",
    category: "Concept",
    instructions: [
      "Fill in the crossword puzzle using provided clues.",
      "Clues may relate to function names, syntax, or behavior.",
    ],
    tips: [
      "Think about commonly used terms like `def`, `class`, `loop`.",
      "Use elimination to guess harder terms.",
    ],
    is_initial: false,
    challenges: 1,
    lives: 0,
    time_limit_seconds: 300,
  },
];

export default mockGames;
