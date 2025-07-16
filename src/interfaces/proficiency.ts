export interface Proficiency {
  id: string;
  topic: string;
  percentMastery: number; // range from 0 to 100
}

export const proficiencies: Proficiency[] = [
  {
    id: "intro-python-ide",
    topic: "Introduction to Python & IDE Setup",
    percentMastery: 86,
  },
  {
    id: "variables-data-types",
    topic: "Variables & Data Types",
    percentMastery: 72,
  },
  {
    id: "basic-input-output",
    topic: "Basic Input and Output",
    percentMastery: 0,
  },
  {
    id: "operators",
    topic: "Operators",
    percentMastery: 33,
  },
  {
    id: "comments-readability",
    topic: "Comments & Code Readability",
    percentMastery: 78,
  },
];
