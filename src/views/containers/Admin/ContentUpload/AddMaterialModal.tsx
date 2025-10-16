import { useState, useEffect } from "react";
import axios from "axios";
import type { AxiosResponse } from "axios"; // ✅ type-only import to avoid verbatimModuleSyntax error

interface AddMaterialModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface Topic {
  id: number;
  name: string;
}

interface Subtopic {
  id: number;
  name: string;
  topic_ref: number;
}

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export default function AddMaterialModal({
  onClose,
  onSuccess,
}: AddMaterialModalProps) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [subtopics, setSubtopics] = useState<Subtopic[]>([]);
  const [filteredSubtopics, setFilteredSubtopics] = useState<Subtopic[]>([]);
  const [form, setForm] = useState({
    title: "",
    content: "",
    topic_ref: "",
    subtopic_ref: "",
    order_in_topic: 0,
  });
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const token =
    localStorage.getItem("access_token") ||
    localStorage.getItem("access") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("token");

  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  // ✅ Fully typed fetcher with no implicit any
  const fetchAllPaginated = async <T,>(url: string): Promise<T[]> => {
    let results: T[] = [];
    let nextUrl: string | null = url;

    while (nextUrl) {
      const response: AxiosResponse<PaginatedResponse<T>> = await axios.get<
        PaginatedResponse<T>
      >(nextUrl, { headers });

      const data: PaginatedResponse<T> = response.data;
      if (Array.isArray(data.results)) {
        results = [...results, ...data.results];
      }
      nextUrl = data.next;
    }

    return results;
  };

  // ✅ Initial load (sorted by ID)
  const loadData = async (): Promise<void> => {
    if (!token) return;
    try {
      const [topicList, subtopicList] = await Promise.all([
        fetchAllPaginated<Topic>(
          "http://localhost:8000/api/reading/admin/topics/"
        ),
        fetchAllPaginated<Subtopic>(
          "http://localhost:8000/api/reading/admin/subtopics/"
        ),
      ]);

      // 🔽 Sort by ID before saving
      setTopics(topicList.sort((a, b) => a.id - b.id));
      setSubtopics(subtopicList.sort((a, b) => a.id - b.id));
      setFilteredSubtopics([]);
      console.log("✅ Topics and Subtopics loaded and sorted by ID");
    } catch (err) {
      console.error("❌ Failed to load data:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ✅ Refresh Topics (sorted)
  const reloadTopics = async (): Promise<void> => {
    setRefreshing(true);
    try {
      const response: AxiosResponse<PaginatedResponse<Topic>> = await axios.get<
        PaginatedResponse<Topic>
      >("http://localhost:8000/api/reading/admin/topics/", { headers });

      const data: PaginatedResponse<Topic> = response.data;
      setTopics((data.results || []).sort((a, b) => a.id - b.id));
      console.log("🔄 Topics refreshed & sorted successfully!");
    } catch (err) {
      console.error("❌ Failed to refresh topics:", err);
    } finally {
      setRefreshing(false);
    }
  };

  // ✅ Refresh Subtopics (sorted)
  const reloadSubtopics = async (): Promise<void> => {
    try {
      const response: AxiosResponse<PaginatedResponse<Subtopic>> =
        await axios.get<PaginatedResponse<Subtopic>>(
          "http://localhost:8000/api/reading/admin/subtopics/",
          { headers }
        );

      const data: PaginatedResponse<Subtopic> = response.data;
      const sorted = (data.results || []).sort((a, b) => a.id - b.id);
      setSubtopics(sorted);

      // If a topic is selected, re-filter
      if (form.topic_ref) {
        const filtered = sorted.filter(
          (s) => s.topic_ref === Number(form.topic_ref)
        );
        setFilteredSubtopics(filtered);
      }
      console.log("🔄 Subtopics refreshed & sorted successfully!");
    } catch (err) {
      console.error("❌ Failed to refresh subtopics:", err);
    }
  };

  // ✅ Handle topic change (auto-filter subtopics)
  const handleTopicChange = (topicId: string): void => {
    setForm({ ...form, topic_ref: topicId, subtopic_ref: "" });

    if (!topicId) {
      setFilteredSubtopics([]);
      return;
    }

    const filtered = subtopics.filter(
      (s) => s.topic_ref === Number(topicId)
    );
    setFilteredSubtopics(filtered);
  };

  // ✅ Submit new material
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!token) {
        alert("No authentication token found.");
        return;
      }

      await axios.post(
        "http://localhost:8000/api/reading/admin/materials/",
        {
          title: form.title,
          content: form.content,
          topic_ref: Number(form.topic_ref),
          subtopic_ref: Number(form.subtopic_ref),
          order_in_topic: form.order_in_topic,
        },
        {
          headers: {
            ...headers,
            "Content-Type": "application/json",
          },
        }
      );

      onSuccess();
      await loadData(); // refresh & re-sort after add
      console.log("✅ Material added successfully!");
    } catch (err: any) {
      console.error("❌ Add failed:", err.response?.data || err);
      alert("Failed to add reading material.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ UI
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-[600px] p-6 relative animate-fadeIn">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Add Reading Material
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-[#6B5BD2]"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>

          {/* Topic */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium">Topic</label>
              <button
                type="button"
                onClick={reloadTopics}
                disabled={refreshing}
                className="text-xs text-[#6B5BD2] hover:underline"
              >
                {refreshing ? "Refreshing..." : "↻ Refresh Topics"}
              </button>
            </div>
            <select
              className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-[#6B5BD2]"
              value={form.topic_ref}
              onChange={(e) => handleTopicChange(e.target.value)}
              required
            >
              <option value="">-- Select Topic --</option>
              {topics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Subtopic */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium">Subtopic</label>
              <button
                type="button"
                onClick={reloadSubtopics}
                className="text-xs text-[#6B5BD2] hover:underline"
              >
                ↻ Refresh Subtopics
              </button>
            </div>
            <select
              className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-[#6B5BD2]"
              value={form.subtopic_ref}
              onChange={(e) =>
                setForm({ ...form, subtopic_ref: e.target.value })
              }
              required
            >
              <option value="">-- Select Subtopic --</option>
              {filteredSubtopics.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Order */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Order in Topic
            </label>
            <input
              type="number"
              className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-[#6B5BD2]"
              value={form.order_in_topic}
              onChange={(e) =>
                setForm({
                  ...form,
                  order_in_topic: parseInt(e.target.value) || 0,
                })
              }
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium mb-1">Content</label>
            <textarea
              className="w-full border border-gray-300 rounded p-2 h-40 resize-none focus:ring-2 focus:ring-[#6B5BD2]"
              value={form.content}
              onChange={(e) =>
                setForm({ ...form, content: e.target.value })
              }
              required
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-[#6B5BD2] text-white rounded hover:bg-[#4c3aa6] transition"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
