export interface User {
  id: string;
  name: string;
  totalXP: number;
  level: number; // Level 1–4
}

export const users: User[] = [
  { id: "u1", name: "Julien Veniz", totalXP: 1200, level: 4 },
  { id: "u2", name: "Alliyana Rose", totalXP: 950, level: 3 },
  { id: "u3", name: "Johanne Nacorda", totalXP: 850, level: 3 },
  { id: "u4", name: "Kaye Marie", totalXP: 700, level: 2 },
  { id: "u5", name: "Karen Carigo", totalXP: 600, level: 2 },
  { id: "u6", name: "Jamal Robert", totalXP: 400, level: 1 },
    { id: "u7", name: "Robien Tan", totalXP: 350, level: 1 },
  { id: "u8", name: "Kristian Ceasar", totalXP: 300, level: 1 },
  { id: "u9", name: "Ryu Mendoza", totalXP: 200, level: 1 },
  { id: "u10", name: "Amiel Catado", totalXP: 100, level: 1 },
];
