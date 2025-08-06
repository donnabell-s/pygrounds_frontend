import type { ReactNode } from "react";

type PreviewCardsProps = {
  title: string;
  children: ReactNode;
  className?: string;
  variant?: "instructions" | "stats" | "tips";
};

const PreviewCards = ({ 
  title, 
  children, 
  className = "", 
  variant 
}: PreviewCardsProps) => {
  const getBgColor = () => {
    switch(variant) {
      case "instructions": return "bg-[#2563EB]/20 text-[#0077B6]";
      case "stats": return "bg-[#DC2626]/20 text-[#DC2626]";
      case "tips": return "bg-[#15803D]/20 text-[#15803D]";
      default: return "text-[#6B7280]";
    }
  };



  return (
    <div className={`bg-white rounded-xl shadow-md overflow-hidden ${className}`}>
      <h3 className={`text-xl font-semibold shadow-sm px-6 py-3.5 ${getBgColor()}`}>
        {title}
      </h3>
      <div className="p-6">{children}</div>
    </div>
  );
};

type StatsCardProps = {
  challenges: number;
  lives: number;
  timeLimit: number | null;
};

const StatsCard = ({ challenges, lives, timeLimit }: StatsCardProps) => (
  <PreviewCards title="Game Stats" variant="stats">
    <div className="grid grid-cols-3 gap-4 text-center text-sm">
      <div className="flex flex-col items-center">
        <span className="text-[#2563EB] font-bold text-lg">{challenges}</span>
        <span className="text-xs text-[#6B7280]">Challenges</span>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-[#DC2626] font-bold text-lg">{lives}</span>
        <span className="text-xs text-[#6B7280]">Lives</span>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-[#15803D] font-bold text-lg">
          {timeLimit ? `${timeLimit}s` : "None"}
        </span>
        <span className="text-xs text-[#6B7280]">Time Limit</span>
      </div>
    </div>
  </PreviewCards>
);

type InstructionsCardProps = {
  instructions: (string | { text: string; substeps: string[] })[];
};

const InstructionsCard = ({ instructions }: InstructionsCardProps) => (
  <PreviewCards title="Instructions" variant="instructions" className="h-full">
    <ul className="space-y-2">
      {instructions.map((item, idx) => {
        if (typeof item === "string") {
          return (
            <li key={idx} className="flex">
              <span className="mr-2">•</span>
              <span>{item}</span>
            </li>
          );
        } else {
          return (
            <li key={idx} className="flex flex-col">
              <div className="flex">
                <span className="mr-2">•</span>
                <span>{item.text}</span>
              </div>
              <ul className="ml-5 mt-1 space-y-1">
                {item.substeps.map((sub, subIdx) => (
                  <li key={subIdx} className="flex">
                    <span className="mr-2">◦</span>
                    <span className="text-sm">{sub}</span>
                  </li>
                ))}
              </ul>
            </li>
          );
        }
      })}
    </ul>
  </PreviewCards>
);

type TipsCardProps = {
  tips: string[];
};

const TipsCard = ({ tips }: TipsCardProps) => (
  <PreviewCards title="Pro Tips" variant="tips">
    <ul className="space-y-2">
      {tips.map((tip, idx) => (
        <li key={idx} className="flex">
          <span className="mr-2">•</span>
          <span className="text-sm">{tip}</span>
        </li>
      ))}
    </ul>
  </PreviewCards>
);

export const Cards = {
  Container: PreviewCards,
  Stats: StatsCard,
  Instructions: InstructionsCard,
  Tips: TipsCard
};