import { useState, useEffect } from "react";
import { readingApi } from "../../../../api/readingApi";

const ReadingMaterialSelector = ({ children }: { children: React.ReactNode }) => {
  const [viewType, setViewType] = useState<"documents" | "reading">("documents");
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  // fetch reading materials
  useEffect(() => {
    const fetchMaterials = async () => {
      if (viewType === "reading") {
        setLoading(true);
        setError("");
        try {
          const response = await readingApi.getAll?.();

          const data = Array.isArray(response)
            ? response
            : (response?.results ?? []);

          setMaterials(data);
        } catch (err: any) {
          console.error("Failed to fetch reading materials:", err);
          setError("Failed to load reading materials.");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchMaterials();
  }, [viewType]);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">
          {viewType === "documents" ? "Content Management" : "Reading Materials"}
        </h2>

        {/* Toggle Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewType("documents")}
            className={`px-4 py-2 text-sm font-medium rounded-md border transition-all duration-200 ${
              viewType === "documents"
                ? "bg-[#7054D0] text-white border-[#7054D0] shadow-sm"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
          >
            Uploaded Files
          </button>

          <button
            onClick={() => setViewType("reading")}
            className={`px-4 py-2 text-sm font-medium rounded-md border transition-all duration-200 ${
              viewType === "reading"
                ? "bg-[#7054D0] text-white border-[#7054D0] shadow-sm"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
          >
            Reading Materials
          </button>
        </div>
      </div>

      {/* Main Section */}
      <div className="mt-2">
        {viewType === "documents" ? (
          children
        ) : (
          <div className="bg-gray-50 rounded-md p-6 border border-gray-200 min-h-[200px]">
            {loading ? (
              <p className="text-gray-500">Loading reading materials...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : materials.length === 0 ? (
              <p className="text-gray-500">No reading materials found.</p>
            ) : (
              <div className="space-y-4">
                {materials.map((m) => (
                  <div
                    key={m.id}
                    className="bg-white shadow-sm rounded-md p-4 border border-gray-100 hover:shadow-md transition-all duration-200"
                  >
                    <h3 className="text-lg font-semibold text-gray-900">
                      {m.title}
                    </h3>
                    {m.content && (
                      <p className="text-sm text-gray-600 mt-1">
                        {m.content.length > 200
                          ? `${m.content.substring(0, 200)}...`
                          : m.content}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReadingMaterialSelector;
