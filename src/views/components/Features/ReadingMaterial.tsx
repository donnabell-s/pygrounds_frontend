import { useState, useEffect } from "react";
import { readingApi } from "../../../api/readingApi";
import { AdminTable } from "../UI";
import { ADMIN_BUTTON_STYLES } from "../Layout";
import { MdDelete, MdEdit } from "react-icons/md";
import { IoAdd } from "react-icons/io5";

interface ReadingMaterial {
  id: number;
  title: string;
  content: string;
  subtopic?: {
    id: number;
    title: string;
    topic?: { id: number; title: string };
  };
}

interface PaginatedResponse {
  results: ReadingMaterial[];
  next?: string | null;
  previous?: string | null;
  count?: number;
}

const ReadingMaterial = () => {
  const [materials, setMaterials] = useState<ReadingMaterial[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [subtopics, setSubtopics] = useState<any[]>([]);
  const [filteredSubtopics, setFilteredSubtopics] = useState<any[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<number | null>(null);
  const [selectedSubtopic, setSelectedSubtopic] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<ReadingMaterial | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ show: boolean; id: number | null }>({show: false,id: null,});


  // Pagination states
  const [currentPageUrl, setCurrentPageUrl] = useState<string | null>(
    "http://localhost:8000/api/reading/admin/materials/"
  );
  const [nextPageUrl, setNextPageUrl] = useState<string | null>(null);
  const [prevPageUrl, setPrevPageUrl] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);

  //Fetch reading materials (supports pagination)
  const fetchMaterials = async (url?: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken") || localStorage.getItem("access_token");
      const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await fetch(url || currentPageUrl!, { headers });
      const data: PaginatedResponse = await response.json();

      const formatted = (data.results || []).map((item: any) => ({
        ...item,
        subtopic: {
          id: item.subtopic_ref,
          title: item.subtopic_name,
          topic: {
            id: item.topic_ref,
            title: item.topic_name,
          },
        },
      }));

      setMaterials(formatted);
      setNextPageUrl(data.next || null);
      setPrevPageUrl(data.previous || null);
    } catch (err) {
      console.error("Error loading materials:", err);
      setError("Failed to load materials.");
    } finally {
      setLoading(false);
    }
  };

  // Pagination controls
  const handlePageChange = async (url: string | null, direction: "next" | "prev") => {
    if (!url) return;
    await fetchMaterials(url);
    setPage((prev) => (direction === "next" ? prev + 1 : prev - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Fetch topics and subtopics once
  const loadTopicsAndSubtopics = async () => {
    try {
      const [topicList, subtopicList] = await Promise.all([
        readingApi.getTopics(),
        readingApi.getSubtopics(),
      ]);

      setTopics(topicList.sort((a, b) => a.id - b.id));
      setSubtopics(subtopicList.sort((a, b) => a.id - b.id));
      console.log("Loaded topics:", topicList.length, "subtopics:", subtopicList.length);
    } catch (err) {
      console.error("Failed to load topics/subtopics:", err);
    }
  };

  useEffect(() => {
    fetchMaterials();
    loadTopicsAndSubtopics();
  }, []);

  // Delete material
  const handleDelete = async (id: number) => {
  try {
    await readingApi.delete(id);
    console.log("Deleted successfully");
    setConfirmDelete({ show: false, id: null });

    // Reset pagination to first page after delete
    setPage(1);
    await fetchMaterials("http://localhost:8000/api/reading/admin/materials/");
  } catch (err) {
    console.error(err);
    setError("Failed to delete material");
  }
};

    const handleSave = async (formData: {
      title: string;
      content: string;
      topic?: number;
      subtopic?: number;
    }) => {
      try {
        if (editingMaterial) {
          await readingApi.update(editingMaterial.id, {
            title: formData.title,
            content: formData.content,
            topic_ref: editingMaterial.subtopic?.topic?.id || 0,
            subtopic_ref: editingMaterial.subtopic?.id || 0,
          });
          console.log("Updated successfully");
        } else {
          await readingApi.create({
            title: formData.title,
            content: formData.content,
            topic_ref: formData.topic!,
            subtopic_ref: formData.subtopic!,
          });
          console.log("Created successfully");
        }

        // cclose modal and clear edit state
        setIsModalOpen(false);
        setEditingMaterial(null);

        const firstPageUrl = "http://localhost:8000/api/reading/admin/materials/?ordering=-id";
        setCurrentPageUrl(firstPageUrl);
        setPage(1);
        await fetchMaterials(firstPageUrl);
      } catch (error) {
        console.error("Error during save/update:", error);
        setError("Failed to save or update material.");
      }
    };

  const handleTopicChange = (topicId: number) => {
  setSelectedTopic(topicId);
  setSelectedSubtopic(null);

  const filtered = subtopics.filter((s) => s.topic_ref === topicId);

  console.log("Filtered subtopics for topic", topicId, filtered);
  setFilteredSubtopics(filtered);
};


  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">Reading Materials</h2>
        <button
          onClick={() => {
            setEditingMaterial(null);
            setSelectedTopic(null);
            setSelectedSubtopic(null);
            setFilteredSubtopics([]);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-1 bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-4 py-2 text-sm font-medium rounded-md shadow-sm transition-colors"
        >
          <IoAdd className="w-4 h-4" /> Add New Material
        </button>
      </div>

      {/* Table */}
      <AdminTable
        title="Reading Materials Management"
        loading={loading}
        error={error}
        items={materials}
        total={materials.length}
        currentPage={page}
        onPageChange={() => {}}
        headerColumns={["Title", "Topic", "Subtopic", "Actions"]}
        renderRow={(m: ReadingMaterial) => (
          <tr key={m.id}>
            <td className="px-6 py-4">{m.title}</td>
            <td className="px-6 py-4">{m.subtopic?.topic?.title || "—"}</td>
            <td className="px-6 py-4">{m.subtopic?.title || "—"}</td>
            <td className="px-6 py-4 text-center">
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => {
                    setEditingMaterial(m);
                    setSelectedTopic(m.subtopic?.topic?.id || null);
                    setSelectedSubtopic(m.subtopic?.id || null);
                    setIsModalOpen(true);
                  }}
                  className={ADMIN_BUTTON_STYLES.ICON_PRIMARY}
                  title="Edit"
                >
                  <MdEdit className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setConfirmDelete({ show: true, id: m.id })}
                  className={ADMIN_BUTTON_STYLES.ICON_DANGER}
                  title="Delete"
                >
                  <MdDelete className="w-5 h-5" />
                </button>
              </div>
            </td>
          </tr>
        )}
      />

      {/* Pagination Controls */}
      <div className="flex justify-center items-center space-x-4 mt-4">
        <button
          onClick={() => handlePageChange(prevPageUrl, "prev")}
          disabled={!prevPageUrl}
          className={`px-4 py-2 rounded-md border text-sm font-medium transition-colors ${
            !prevPageUrl
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
          }`}
        >
          ← Previous
        </button>

        <span className="text-sm text-gray-600">Page {page}</span>

        <button
          onClick={() => handlePageChange(nextPageUrl, "next")}
          disabled={!nextPageUrl}
          className={`px-4 py-2 rounded-md border text-sm font-medium transition-colors ${
            !nextPageUrl
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
          }`}
        >
          Next →
        </button>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 backdrop-blur-md bg-black/30 flex justify-center items-center z-50">
          <div className="bg-white rounded-md shadow-lg p-6 w-full max-w-lg">
            <h3 className="text-lg font-semibold mb-4">
              {editingMaterial ? "Edit Reading Material" : "Add Reading Material"}
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                console.log("Form submitted"); // <-- ADD THIS
                const form = e.currentTarget;
                const title = (form.elements.namedItem("title") as HTMLInputElement).value;
                const content = (form.elements.namedItem("content") as HTMLTextAreaElement).value;

                if (editingMaterial) {
                  console.log("Editing:", editingMaterial.id);
                  handleSave({ title, content });
                } else {
                  const topic = Number((form.elements.namedItem("topic") as HTMLSelectElement).value);
                  const subtopic = Number((form.elements.namedItem("subtopic") as HTMLSelectElement).value);
                  handleSave({ title, content, topic, subtopic });
                }
              }}
            >

              {!editingMaterial && (
                <>
                  {/* Topic Dropdown */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Topic</label>
                    <select
                      name="topic"
                      required
                      value={selectedTopic || ""}
                      onChange={(e) => handleTopicChange(Number(e.target.value))}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-[#2563EB] focus:border-[#2563EB]"
                    >
                      <option value="">Select a Topic</option>
                      {topics.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Subtopic Dropdown */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Subtopic</label>
                    <select
                      name="subtopic"
                      required
                      value={selectedSubtopic || ""}
                      onChange={(e) => setSelectedSubtopic(Number(e.target.value))}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-[#2563EB] focus:border-[#2563EB]"
                    >
                      <option value="">
                        {selectedTopic ? "Select a Subtopic" : "Select a topic first"}
                      </option>
                      {filteredSubtopics.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                    {filteredSubtopics.length === 0 && selectedTopic && (
                      <p className="text-xs text-gray-500 italic mt-1">
                        No subtopics found for this topic.
                      </p>
                    )}
                  </div>
                </>
              )}

              {/* Title & Content */}
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  name="title"
                  defaultValue={editingMaterial?.title || ""}
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-[#2563EB] focus:border-[#2563EB]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Content</label>
                <textarea
                  name="content"
                  defaultValue={editingMaterial?.content || ""}
                  required
                  rows={6}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-[#2563EB] focus:border-[#2563EB]"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                  <button
                    type="submit"
                    className={`px-4 py-2 rounded-md text-white font-medium ${
                      editingMaterial
                        ? "bg-[#2563EB] hover:bg-[#1D4ED8]"
                        : "bg-green-600 hover:bg-green-700"
                    } transition-colors`}
                  >
                    {editingMaterial ? "Update" : "Save"}
                  </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* delete modal  */}
      {confirmDelete.show && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm text-center animate-fadeIn">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Delete Reading Material
            </h3>
            <p className="text-sm text-gray-600 mb-5">
              Are you sure you want to delete this reading material? This action cannot be undone.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setConfirmDelete({ show: false, id: null })}
                className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmDelete.id && handleDelete(confirmDelete.id)}
                className="px-4 py-2 rounded-md bg-[#2563EB] text-white hover:bg-[#1D4ED8] font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReadingMaterial;
