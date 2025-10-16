import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Edit, Trash2 } from "lucide-react";
import axios from "axios";
import UpdateMaterialModal from "./UpdateMaterialModal";

interface ReadingMaterial {
  id: number;
  title: string;
  content: string;
  topic_ref: number;
  topic_name: string;
  subtopic_ref: number;
  subtopic_name: string;
  order_in_topic: number;
  created_at: string;
  updated_at: string;
}

interface ApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ReadingMaterial[];
}

interface OutletContext {
  apiResponse: ApiResponse | null;
  isLoading: boolean;
  onFetch?: () => void;
  isAdmin?: boolean;
}

const UploadedFiles = () => {
  const { apiResponse, isLoading, onFetch, isAdmin = true } =
    useOutletContext<OutletContext>();
  const [materials, setMaterials] = useState<ReadingMaterial[]>([]);
  const [selectedMaterial, setSelectedMaterial] =
    useState<ReadingMaterial | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // 🟣 Delete modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [materialToDelete, setMaterialToDelete] =
    useState<ReadingMaterial | null>(null);

  useEffect(() => {
    if (!isLoading && apiResponse?.results) {
      setMaterials(apiResponse.results);
    }
  }, [apiResponse, isLoading]);

  const handleDeleteClick = (material: ReadingMaterial) => {
    setMaterialToDelete(material);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!materialToDelete) return;

    const token =
      localStorage.getItem("jwt") ||
      localStorage.getItem("authToken") ||
      localStorage.getItem("access_token") ||
      localStorage.getItem("access") ||
      localStorage.getItem("accessToken") ||
      localStorage.getItem("token");

    if (!token) {
      alert("No token found.");
      return;
    }

    try {
      await axios.delete(
        `http://localhost:8000/api/reading/admin/materials/${materialToDelete.id}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setMaterials((prev) =>
        prev.filter((m) => m.id !== materialToDelete.id)
      );
      setShowDeleteModal(false);
      setMaterialToDelete(null);
      onFetch?.();
    } catch (err) {
      console.error("❌ Failed to delete material:", err);
      alert("Failed to delete material.");
    }
  };

  const handleEdit = (material: ReadingMaterial) => {
    setSelectedMaterial(material);
    setShowEditModal(true);
  };

  return (
    <div
      className={`p-4 transition-opacity duration-300 ${
        isLoading ? "opacity-70" : "opacity-100"
      }`}
    >
      {materials.length === 0 ? (
        <p className="text-gray-500">No reading materials found.</p>
      ) : (
        materials.map((material) => (
          <div
            key={material.id}
            className="relative bg-white shadow-md rounded p-4 mb-4 transition-all duration-300 hover:shadow-lg"
          >
            {isAdmin && (
              <div className="absolute top-2 right-2 flex gap-2">
                <button
                  onClick={() => handleEdit(material)}
                  className="p-1 rounded hover:bg-gray-100 transition"
                  title="Edit"
                >
                  <Edit className="w-4 h-4 text-blue-600" />
                </button>
                <button
                  onClick={() => handleDeleteClick(material)}
                  className="p-1 rounded hover:bg-gray-100 transition"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </div>
            )}

            <h3 className="text-lg font-semibold">{material.title}</h3>
            <p className="text-sm text-gray-600 mb-2">
              Topic: {material.topic_name} | Subtopic: {material.subtopic_name}
            </p>
            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{
                __html: material.content.replaceAll("\n", "<br>"),
              }}
            />
          </div>
        ))
      )}

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50/50 backdrop-blur-sm text-gray-600 text-sm">
          Loading next page...
        </div>
      )}

      {showEditModal && selectedMaterial && (
        <UpdateMaterialModal
          material={selectedMaterial}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            onFetch?.();
            setShowEditModal(false);
          }}
        />
      )}

      {/* 🟣 Custom Delete Confirmation Modal */}
      {showDeleteModal && materialToDelete && (
  <div className="fixed inset-0 z-[999] flex items-center justify-center">
    {/* Background blur + dim layer */}
    <div className="absolute inset-0 bg-black/30 backdrop-blur-[4px] transition-all duration-300"></div>

    {/* Modal box */}
    <div className="relative bg-white rounded-lg shadow-xl w-[380px] p-6 text-center transform scale-95 animate-popIn">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">
        Delete Confirmation
      </h3>
      <p className="text-gray-600 mb-5">
        Are you sure you want to delete{" "}
        <span className="font-medium text-gray-800">
          “{materialToDelete.title}”
        </span>
        ?
      </p>
      <div className="flex justify-center gap-4">
        <button
          onClick={() => setShowDeleteModal(false)}
          className="px-5 py-2 rounded-lg bg-gray-300 text-gray-800 font-medium hover:bg-gray-400 transition-all"
        >
          Cancel
        </button>
        <button
          onClick={confirmDelete}
          className="px-5 py-2 rounded-lg bg-[#6B5BD2] text-white font-medium hover:bg-[#4c3aa6] transition-all"
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

export default UploadedFiles;
