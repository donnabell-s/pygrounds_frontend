import { useState, useEffect } from "react";
import axios from "axios";
import type { AxiosResponse } from "axios";

interface UpdateMaterialModalProps {
  material: {
    id: number;
    title: string;
    content: string;
    topic_ref: number;
    subtopic_ref: number;
    order_in_topic: number;
  };
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

export default function UpdateMaterialModal({
  material,
  onClose,
  onSuccess,
}: UpdateMaterialModalProps) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [subtopics, setSubtopics] = useState<Subtopic[]>([]);
  const [filteredSubtopics, setFilteredSubtopics] = useState<Subtopic[]>([]);
  const [form, setForm] = useState({
    title: material.title,
    content: material.content,
    topic_ref: material.topic_ref.toString(),
    subtopic_ref: material.subtopic_ref.toString(),
    order_in_topic: material.order_in_topic,
  });
  const [loading, setLoading] = useState(false);

  const token =
    localStorage.getItem("access_token") ||
    localStorage.getItem("access") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("token");

  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  // 🔹 Fetch all topics and subtopics
  const fetchAllPaginated = async <T,>(url: string): Promise<T[]> => {
    let results: T[] = [];
    let nextUrl: string | null = url;

    while (nextUrl) {
      const response: AxiosResponse<PaginatedResponse<T>> = await axios.get<
        PaginatedResponse<T>
      >(nextUrl, { headers });
      const data: PaginatedResponse<T> = response.data;
      results = [...results, ...data.results];
      nextUrl = data.next;
    }
    return results;
  };

  // 🔹 Load Topics and Subtopics
  useEffect(() => {
    const loadData = async () => {
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
        setTopics(topicList.sort((a, b) => a.id - b.id));
        setSubtopics(subtopicList.sort((a, b) => a.id - b.id));
        // Filter subtopics for current topic
        const filtered = subtopicList.filter(
          (s) => s.topic_ref === material.topic_ref
        );
        setFilteredSubtopics(filtered);
      } catch (err) {
        console.error("❌ Failed to load topics/subtopics:", err);
      }
    };
    loadData();
  }, [material]);

  // 🔹 Handle Topic Change
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

  // 🔹 Submit update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.put(
        `http://localhost:8000/api/reading/admin/materials/${material.id}/`,
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

      console.log(`✅ Material ${material.id} updated successfully`);
      onSuccess();
      onClose();
    } catch (err) {
      console.error("❌ Update failed:", err);
      alert("Failed to update material.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-[600px] p-6 relative animate-fadeIn">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Update Reading Material
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
            <label className="block text-sm font-medium mb-1">Topic</label>
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
            <label className="block text-sm font-medium mb-1">Subtopic</label>
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
              onChange={(e) => setForm({ ...form, content: e.target.value })}
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
              {loading ? "Updating..." : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
