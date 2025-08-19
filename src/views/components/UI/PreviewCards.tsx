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
  variant,
}: PreviewCardsProps) => {
  const getColors = () => {
    switch (variant) {
      case "instructions":
        return { color: "#2563EB", bg: "bg-[#2563EB]/17" };
      case "stats":
        return { color: "#DC2626", bg: "bg-[#DC2626]/17" };
      case "tips":
        return { color: "#15803D", bg: "bg-[#15803D]/17" };
      default:
        return { color: "#6B7280", bg: "bg-[#6B7280]/17" };
    }
  };

  const { color, bg } = getColors();

  return (
    <div
      className={`relative overflow-hidden bg-white w-full rounded-2xl shadow-md border border-[#E4ECF7] ring-1 ${className}`}
      style={{ 
        // soft tinted ring from variant color
        boxShadow: `0 0 0 1px ${color}33, 0 1px 2px rgba(0,0,0,0.05)` // 33 = ~20% opacity
      }}
    >

      {/* Overlay */}
      <div className="pointer-events-none absolute inset-0 z-0 rounded-2xl bg-gradient-to-br from-white/30 to-transparent" />

      {/* Header */}
      <div
        className={`relative z-10 flex flex-col px-6 py-3.5 ${bg} gap-1 shadow-sm rounded-t-2xl`}
      >
        <h3 className="text-lg font-semibold" style={{ color }}>
          {title}
        </h3>
      </div>

      {/* Body */}
      <div className="relative z-10 p-6">{children}</div>
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
      {instructions.map((item, idx) =>
        typeof item === "string" ? (
          <li key={idx} className="flex">
            <span className="mr-2">•</span>
            <span>{item}</span>
          </li>
        ) : (
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
        )
      )}
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
  Tips: TipsCard,
};
