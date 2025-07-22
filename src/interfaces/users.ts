export interface User {
  id: string;
  name: string;
  username: string;
  totalXP: number;
  level: number; // Level 1–4
}

export const users: User[] = [
  { id: "u1", name: "Julien Veniz", username:"@benizz", totalXP: 1200, level: 4 },
  { id: "u2", name: "Alliyana Rose", username:"@benizz", totalXP: 950, level: 3 },
  { id: "u3", name: "Johanne Nacorda", username:"@benizz", totalXP: 850, level: 3 },
  { id: "u4", name: "Kaye Marie", username:"@benizz", totalXP: 700, level: 2 },
  { id: "u5", name: "Karen Carigo", username:"@benizz", totalXP: 600, level: 2 },
  { id: "u6", name: "Jamal Robert", username:"@benizz", totalXP: 400, level: 1 },
    { id: "u7", name: "Robien Tan", username:"@benizz", totalXP: 350, level: 1 },
  { id: "u8", name: "Kristian Ceasar", username:"@benizz", totalXP: 300, level: 1 },
  { id: "u9", name: "Ryu Mendoza", username:"@benizz", totalXP: 200, level: 1 },
  { id: "u10", name: "Amiel Catado", username:"@benizz", totalXP: 100, level: 1 },
];
