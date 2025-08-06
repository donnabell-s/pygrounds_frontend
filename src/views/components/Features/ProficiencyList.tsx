import { useAdaptive } from "../../../context/AdaptiveContext";

// ✅ Config for proficiency levels
const PROFICIENCY_LEVELS = [
  { threshold: 0, label: "No Progress", color: "#6B7280" },
  { threshold: 1, label: "Beginner", color: "#2563EB" },
  { threshold: 33, label: "Intermediate", color: "#CA8A04" },
  { threshold: 66, label: "Advanced", color: "#15803D" },
  { threshold: 100, label: "Master", color: "#7E5CE3" },
];

// ✅ Utility functions
const getProficiencyLevel = (percent: number) => {
  for (let i = PROFICIENCY_LEVELS.length - 1; i >= 0; i--) {
    if (percent >= PROFICIENCY_LEVELS[i].threshold) return PROFICIENCY_LEVELS[i];
  }
  return PROFICIENCY_LEVELS[0];
};

const hexToRgba = (hex: string, opacity: number) => {
  const bigint = parseInt(hex.replace("#", ""), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

// ✅ Reusable Card
const ProficiencyCard = ({ topic, percent }: { topic: string; percent: number }) => {
  const { label, color } = getProficiencyLevel(percent);

  return (
    <div className="flex items-start gap-4 px-4 py-5 bg-[#704EE7]/10 border border-[#E4ECF7] rounded-xl shadow-sm">
      <div className="flex flex-col w-full gap-3">
        <div className="flex justify-between items-center">
          <h4 className="text-md font-bold text-[#111827]">{topic}</h4>
          <span
            className="text-xs font-semibold px-3 py-1 rounded-full"
            style={{ color, backgroundColor: hexToRgba(color, 0.15) }}
          >
            {label}
          </span>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-xs mt-1">
            <span className="font-bold text-[#6B7280]">Proficiency</span>
            <span className="font-bold" style={{ color }}>
              {percent.toFixed(0)}%
            </span>
          </div>
          <div className="w-full h-3 bg-white rounded-full overflow-hidden">
            <div
              className="h-full transition-all duration-500"
              style={{ width: `${percent}%`, backgroundColor: color }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const ProficiencyList = () => {
  const { topicProgress, isLoading } = useAdaptive();

  if (isLoading) {
    return (
      <div className="bg-[#FFFFFF] w-full rounded-xl shadow-md p-6">
        <p className="text-gray-500">Loading topic proficiency...</p>
      </div>
    );
  }

  if (!topicProgress?.length) {
    return (
      <div className="bg-[#FFFFFF] w-full rounded-xl shadow-md p-6">
        <p className="text-gray-500">No topic progress found.</p>
      </div>
    );
  }

  const sortedTopics = [...topicProgress].sort((a, b) => a.topic.id - b.topic.id);

  return (
    <div className="bg-[#FFFFFF] w-full rounded-xl shadow-md">
      <div className="flex flex-col px-6 py-3.5 bg-[#704EE7]/10 gap-1 shadow-sm rounded-t-xl">
        <h3 className="text-xl font-semibold">Topic Proficiency</h3>
        <p className="text-sm text-[#6B7280]">
          Track your mastery across Python concepts
        </p>
      </div>

      <div className="p-6 flex flex-col gap-4">
        {sortedTopics.map((p) => (
          <ProficiencyCard
            key={p.topic.id}
            topic={p.topic.name}
            percent={p.proficiency_percent}
          />
        ))}
      </div>
    </div>
  );
};

export default ProficiencyList;
