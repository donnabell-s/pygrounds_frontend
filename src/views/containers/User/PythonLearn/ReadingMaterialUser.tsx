import {
  useEffect,
  useState,
  useImperativeHandle,
  forwardRef,
} from "react";
import { readingApi } from "../../../../api/readingApi";

export interface ReadingMaterialUserRef {
  jumpToSubtopic: (subId: number) => void;
}

interface ReadingMaterial {
  id: number;
  title: string;
  content: string;
  topic_ref?: number;
  subtopic_ref?: number;
  topic_name?: string;
  subtopic_name?: string;
}

interface Props {
  setActiveSubtopic: (id: number) => void;
}

const ReadingMaterialUser = forwardRef<ReadingMaterialUserRef, Props>(
  ({ setActiveSubtopic }, ref) => {
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

        // 🔥 FINAL ORDER (Seeder order)
        const sorted = [...data].sort((a, b) => {
          if (a.topic_ref !== b.topic_ref) return a.topic_ref - b.topic_ref;
          if (a.subtopic_ref !== b.subtopic_ref)
            return a.subtopic_ref - b.subtopic_ref;
          return a.id - b.id;
        });

        setMaterials(sorted);
      } catch (err) {
        setError("Failed to load reading materials.");
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      fetchMaterials();
    }, []);

    // pagination
    const totalPages = Math.ceil(materials.length / ITEMS_PER_PAGE);
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const currentMaterials = materials.slice(
      startIndex,
      startIndex + ITEMS_PER_PAGE
    );

    // ⭐ GROUP BY REAL TOPIC NAME
const grouped = currentMaterials.reduce((acc, item) => {
  // Use the actual topic name from backend
  const topic = item.topic_name ?? `Topic ${item.topic_ref}`;

  if (!acc[topic]) acc[topic] = [];
  acc[topic].push(item);

  return acc;
}, {} as Record<string, ReadingMaterial[]>);



    // ⭐ expose jumpToSubtopic to parent
    useImperativeHandle(ref, () => ({
      jumpToSubtopic(subId: number) {
        const index = materials.findIndex((m) => m.subtopic_ref === subId);
        if (index === -1) return;

        const targetPage = Math.floor(index / ITEMS_PER_PAGE) + 1;

        setPage(targetPage);

        setTimeout(() => {
          const el = document.getElementById(`subtopic-${subId}`);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
            setActiveSubtopic(subId);
          }
        }, 250);
      },
    }));

    useEffect(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, [page]);

    return (
      <div className="flex flex-col gap-12">
        {loading ? (
          <p>Loading…</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          // 🔥🔥 NEW: Render by topic with topic header
          Object.keys(grouped).map((topicLabel) => (
            <div key={topicLabel} className="flex flex-col gap-6">
              {/* TOPIC TITLE */}
              <h2 className="text-2xl font-bold text-[#3776AB] tracking-wide">
                {topicLabel}
              </h2>

              {/* SUBTOPIC CARDS */}
              {grouped[topicLabel].map((mat) => (
                <div
                  key={mat.id}
                  id={`subtopic-${mat.subtopic_ref}`}
                  className="scroll-mt-32 bg-white border border-gray-200 rounded-lg p-5 shadow-sm"
                >
                  <h3 className="text-xl font-semibold text-gray-900">
                    {mat.title}
                  </h3>

                  <p className="text-gray-700 whitespace-pre-line mt-2">
                    {mat.content}
                  </p>
                </div>
              ))}
            </div>
          ))
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-6 mt-10">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-gray-100 rounded disabled:opacity-50"
            >
              ← Previous
            </button>

            <span className="text-gray-600">
              Page {page} / {totalPages}
            </span>

            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-gray-100 rounded disabled:opacity-50"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    );
  }
);

export default ReadingMaterialUser;
