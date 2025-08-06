export interface User {
  id: string;
  name: string;
  username: string;
  totalXP: number;
  level: string; // Level 1–4
}

export const users: User[] = [
  { id: "u1", name: "Julien Veniz", username:"benizz", totalXP: 1200, level: "Master" },
  { id: "u2", name: "Alliyana Rose", username:"benizz", totalXP: 950, level: "Master" },
  { id: "u3", name: "Johanne Nacorda", username:"benizz", totalXP: 850, level: "Master" },
  { id: "u4", name: "Kaye Marie", username:"benizz", totalXP: 700, level: "Intermediate" },
  { id: "u5", name: "Karen Carigo", username:"benizz", totalXP: 600, level: "Intermediate" },
  { id: "u6", name: "Jamal Robert", username:"benizz", totalXP: 400, level: "Beginner" },
    { id: "u7", name: "Robien Tan", username:"benizz", totalXP: 350, level: "Beginner" },
  { id: "u8", name: "Kristian Ceasar", username:"benizz", totalXP: 300, level: "Beginner" },
  { id: "u9", name: "Ryu Mendoza", username:"benizz", totalXP: 200, level: "Beginner" },
  { id: "u10", name: "Amiel Catado", username:"benizz", totalXP: 100, level: "Beginner" },
];
