import { useEffect, useMemo, useState } from "react";
import { useAdaptive } from "../../../context/AdaptiveContext";
import { FaSquareCaretRight, FaSquareCaretLeft } from "react-icons/fa6";
import { FaChevronCircleRight, FaChevronCircleLeft, FaAngleRight , FaAngleLeft } from "react-icons/fa";

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

// 🔎 Zone helpers (reads directly from topic.zone)
type ZoneShape = { number?: number; id?: number; name?: string } | number | string | null | undefined;

const getZoneNumber = (zone: ZoneShape): number => {
  if (zone && typeof zone === "object") return Number(zone.number ?? zone.id ?? 0);
  return Number(zone ?? 0);
};

const getZoneLabel = (zone: ZoneShape): string => {
  if (zone && typeof zone === "object") return zone.name ?? `Zone ${getZoneNumber(zone) || 0}`;
  return `Zone ${getZoneNumber(zone) || 0}`;
};

// ✅ Reusable Card
const ProficiencyCard = ({ topic, percent }: { topic: string; percent: number }) => {
  const { label, color } = getProficiencyLevel(percent);

  return (
    <div className="relative overflow-hidden flex items-start gap-4 px-4 py-5 bg-[#704EE7]/15 border border-[#E4ECF7] rounded-xl shadow-sm">
      {/* Overlay */}
      <div className="pointer-events-none absolute inset-0 z-0 rounded-xl bg-gradient-to-br from-white/30 to-transparent" />

      {/* Content */}
      <div className="relative z-10 flex flex-col w-full gap-3">
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

type TP = {
  topic: {
    id: number;
    name: string;
    zone?: ZoneShape; // ← uses topicProgress[i].topic.zone
  };
  proficiency_percent: number;
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

  const sortedTopics: TP[] = useMemo(
    () => [...topicProgress].sort((a: TP, b: TP) => a.topic.id - b.topic.id),
    [topicProgress]
  );

  // Build available zones from topic.zone
  const zones = useMemo(() => {
    const m = new Map<number, string>();
    for (const p of sortedTopics) {
      const zn = getZoneNumber(p.topic.zone);
      const lbl = getZoneLabel(p.topic.zone);
      if (zn) m.set(zn, lbl);
    }
    if (m.size === 0) m.set(0, "Zone 0");
    return Array.from(m.entries()).sort((a, b) => a[0] - b[0]); // [zoneNumber, label][]
  }, [sortedTopics]);

  const [activeZone, setActiveZone] = useState<number | null>(null);

  useEffect(() => {
    if (activeZone === null) setActiveZone(zones[0][0]); // default to first zone
  }, [activeZone, zones]);

  const visibleTopics = useMemo(() => {
    if (activeZone == null) return [];
    return sortedTopics.filter((p) => getZoneNumber(p.topic.zone) === activeZone);
  }, [sortedTopics, activeZone]);

  const zoneIndex = zones.findIndex(([n]) => n === activeZone);
  const onPrev = () => {
    if (!zones.length || activeZone == null) return;
    const i = zoneIndex <= 0 ? zones.length - 1 : zoneIndex - 1;
    setActiveZone(zones[i][0]);
  };
  const onNext = () => {
    if (!zones.length || activeZone == null) return;
    const i = zoneIndex >= zones.length - 1 ? 0 : zoneIndex + 1;
    setActiveZone(zones[i][0]);
  };

  return (
    <div className="relative overflow-hidden bg-[#FFFFFF] w-full rounded-2xl shadow-md border border-white/40 ring-1 ring-[#704EE7]/20">
      {/* Overlay */}
      <div className="pointer-events-none absolute inset-0 z-0 rounded-2xl bg-gradient-to-br from-white/30 to-transparent" />

      {/* Header (clean, no pagination) */}
      <div className="relative z-10 flex flex-col px-6 py-3.5 bg-[#704EE7]/15 gap-1 shadow-sm rounded-t-2xl">
        <h3 className="text-xl font-semibold">Topic Proficiency</h3>
        <p className="text-sm text-[#6B7280]">Track your mastery across Python concepts</p>
      </div>

      {/* Cards */}
      <div className="relative z-10 p-6 flex flex-col gap-4">
        {visibleTopics.length === 0 ? (
          <div className="text-sm text-[#6B7280]">No topics found in this zone.</div>
        ) : (
          visibleTopics.map((p) => (
            <ProficiencyCard key={p.topic.id} topic={p.topic.name} percent={p.proficiency_percent} />
          ))
        )}
      </div>

      {/* Footer pagination at the bottom */}
      <div className="relative z-10 px-6 py-3.5 bg-white border-t border-[#E4ECF7] rounded-b-2xl flex items-center justify-between">
        <div className="text-xs text-[#6B7280]">
          {activeZone != null && zones.length
            ? `${zones[zoneIndex]?.[1] ?? `Zone ${activeZone}`} • ${visibleTopics.length} topic${
                visibleTopics.length !== 1 ? "s" : ""
              }`
            : "No zones"}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onPrev}
            className="text-sm transition cursor-pointer"
            aria-label="Previous zone"
          >
            <FaAngleLeft size={20}/>
          </button>

          <select
            className="px-3 py-2 text-sm rounded-lg border border-[#E4ECF7] bg-white"
            value={activeZone ?? ""}
            onChange={(e) => setActiveZone(Number(e.target.value))}
            aria-label="Select zone"
          >
            {zones.map(([zn, label]) => (
              <option key={zn} value={zn}>
                {label}
              </option>
            ))}
          </select>

          <button
            onClick={onNext}
            className="text-sm transition cursor-pointer"
            aria-label="Next zone"
          >
            <FaAngleRight size={20}/>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProficiencyList;
