import { useEffect, useState } from "react";
import { readingApi } from "../../../../api/readingApi";

interface ReadingMaterial {
  id: number;
  title: string;
  content: string;
  topic_name?: string;
  subtopic_name?: string;
  topic_ref?: number;
  subtopic_ref?: number;
}

const ReadingMaterialUser = () => {
  const [materials, setMaterials] = useState<ReadingMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const response = await readingApi.getAll();
      const data = Array.isArray(response) ? response : response?.results ?? [];
      setMaterials(data);
      console.log("Raw data length from API:", data.length);
    } catch (err) {
      console.error("Failed to load reading materials:", err);
      setError("Failed to load reading materials.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  // ✅ Sort by topic (alphabetically), then by ID ascending
  const sortedMaterials = [...materials].sort((a, b) => {
    const topicA = (a.topic_name || "Uncategorized").toLowerCase();
    const topicB = (b.topic_name || "Uncategorized").toLowerCase();
    if (topicA < topicB) return -1;
    if (topicA > topicB) return 1;
    return a.id - b.id;
  });

  // ✅ Group by topic
  const groupedByTopic: Record<string, ReadingMaterial[]> = sortedMaterials.reduce(
    (acc, item) => {
      const topic = item.topic_name || "Uncategorized";
      if (!acc[topic]) acc[topic] = [];
      acc[topic].push(item);
      return acc;
    },
    {} as Record<string, ReadingMaterial[]>
  );

  // ✅ Remove duplicates within each topic (by title + content)
  for (const topic in groupedByTopic) {
    const uniqueMap = new Map<string, ReadingMaterial>();
    groupedByTopic[topic].forEach((m) => {
      const key = `${m.title.trim().toLowerCase()}|${m.content
        .trim()
        .toLowerCase()}`;
      if (!uniqueMap.has(key)) uniqueMap.set(key, m);
    });
    groupedByTopic[topic] = Array.from(uniqueMap.values());
  }

  // ✅ Flatten all topics (preserve topic group but for pagination)
  const flattened: ReadingMaterial[] = Object.keys(groupedByTopic)
    .sort((a, b) => a.localeCompare(b)) // sort topics alphabetically
    .flatMap((topic) =>
      groupedByTopic[topic].sort((a, b) => a.id - b.id).map((m) => ({
        ...m,
        topic_name: topic,
      }))
    );

console.log("📦 Flattened materials length:", flattened.length); // 👈 INSERT HERE
console.log("📄 Total pages:", Math.ceil(flattened.length / ITEMS_PER_PAGE));

  // ✅ Pagination logic
  const totalPages = Math.ceil(flattened.length / ITEMS_PER_PAGE);
  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const currentMaterials = flattened.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  // ✅ Group current materials by topic for rendering
  const groupedCurrent: Record<string, ReadingMaterial[]> = currentMaterials.reduce(
    (acc, item) => {
      const topic = item.topic_name || "Uncategorized";
      if (!acc[topic]) acc[topic] = [];
      acc[topic].push(item);
      return acc;
    },
    {} as Record<string, ReadingMaterial[]>
  );

  // ✅ Scroll back to top on page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  return (
    <div className="flex flex-col gap-10">

      {/* ✅ Loading / Error / Empty states */}
      {loading ? (
        <p className="text-gray-500">Loading materials...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : flattened.length === 0 ? (
        <p className="text-gray-500 italic">No reading materials available.</p>
      ) : (
        // ✅ Render grouped topics for the current page
        Object.keys(groupedCurrent).map((topic) => (
          <div key={topic} className="flex flex-col gap-4">
            <h3 className="text-xl font-bold text-[#3776AB] uppercase tracking-wide border-b border-gray-300 pb-1">
              {topic}
            </h3>

            {groupedCurrent[topic].map((mat) => (
              <div
                key={mat.id}
                className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-all"
              >
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  {mat.title}
                </h4>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                  {mat.content}
                </p>
              </div>
            ))}
          </div>
        ))
      )}

      {/* ✅ Pagination Controls (always visible when > 1 page) */}
        {totalPages > 1 && (
        <div className="w-full flex justify-center mt-12 mb-8">
            <div className="flex items-center gap-6 bg-white border border-gray-200 rounded-xl shadow-sm px-6 py-3">
            <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                page === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                    : "bg-[#3776AB] text-white hover:bg-[#2f5f8f]"
                }`}
            >
                ← Previous
            </button>

            <span className="text-sm font-medium text-gray-700">
                Page <span className="font-semibold text-[#3776AB]">{page}</span> of{" "}
                <span className="font-semibold">{totalPages}</span>
            </span>

            <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                page === totalPages
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                    : "bg-[#3776AB] text-white hover:bg-[#2f5f8f]"
                }`}
            >
                Next →
            </button>
            </div>
        </div>
        )}
    </div>
  );
};

export default ReadingMaterialUser;
