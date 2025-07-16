import { proficiencies } from "../../../interfaces";

const getRating = (percent: number) => {
  if (percent === 0) return { label: "Not Started", color: "#8B0000" };
  if (percent < 40) return { label: "Beginner", color: "#0077B6" };
  if (percent < 75) return { label: "Intermediate", color: "#F39C12" };
  return { label: "Advanced", color: "#2E8B57" };
};

const hexToRgba = (hex: string, opacity: number) => {
  const bigint = parseInt(hex.replace("#", ""), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

const ProficiencyCard = ({ topic, percentMastery }: { topic: string; percentMastery: number }) => {
  const { label, color } = getRating(percentMastery);

  return (
    <div className="flex items-start gap-4 px-4 py-5 bg-[#F1F5FA] border border-[#E4ECF7] rounded-lg shadow-sm">
      <div className="flex flex-col w-full gap-3">
        <div className="flex justify-between items-center">
          <h4 className="text-md font-bold text-[#111827]">{topic}</h4>
          <span
            className="text-xs font-semibold px-3 py-1 rounded-full"
            style={{
              color: color,
              backgroundColor: hexToRgba(color, 0.15),
            }}
          >
            {label}
          </span>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-xs mt-1">
            <span className="font-bold text-[#6B7280]">Proficiency</span>
            <span className="font-bold" style={{ color }}>{percentMastery}%</span>
          </div>

          <div className="w-full h-3 bg-white rounded-full overflow-hidden">
            <div
              className="h-full transition-all duration-500"
              style={{ width: `${percentMastery}%`, backgroundColor: color }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProficiencyList = () => {
  return (
    <div className="bg-[#FFFFFF] w-full rounded-lg shadow-md">
      <div className="flex flex-col px-6 py-3.5 bg-[#F1F5FA] gap-1 shadow-sm">
        <h3 className="text-xl font-semibold">Topic Proficiency</h3>
        <p className="text-sm text-[#6B7280]">
          Track your mastery across Python concepts
        </p>
      </div>

      <div className="p-6 flex flex-col gap-4">
        {proficiencies.map((p) => (
          <ProficiencyCard key={p.id} topic={p.topic} percentMastery={p.percentMastery} />
        ))}
      </div>
    </div>
  );
};

export default ProficiencyList;
