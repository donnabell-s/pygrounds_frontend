import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import AddMaterialModal from "../ContentUpload/AddMaterialModal";
import * as Component from "../../../components"; // ✅ ensure AdminSideNav works

interface ApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: any[];
}

const AdminMain = () => {
  const location = useLocation();
  const [showSubHeader, setShowSubHeader] = useState(false);
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    setShowSubHeader(location.pathname.includes("/content-upload"));
  }, [location]);

  const extractPageNumber = (url: string | null): number | null => {
    if (!url) return null;
    const match = url.match(/page=(\d+)/);
    return match ? parseInt(match[1], 10) : null;
  };

  const fetchMaterials = async (url?: string) => {
    const baseUrl = "http://localhost:8000/api/reading/admin/materials/";
    const fetchUrl = url || baseUrl;

    const token =
      localStorage.getItem("jwt") ||
      localStorage.getItem("authToken") ||
      localStorage.getItem("access_token") ||
      localStorage.getItem("access") ||
      localStorage.getItem("accessToken") ||
      localStorage.getItem("token");

    if (!token) {
      console.warn("No token found. Unable to fetch materials.");
      return;
    }

    try {
      setIsLoading(true);
      const res = await axios.get<ApiResponse>(fetchUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      setApiResponse(res.data);
      const pageNum =
        extractPageNumber(fetchUrl) ||
        (res.data.previous ? extractPageNumber(res.data.previous)! + 1 : 1);
      setCurrentPage(pageNum);
      console.log("Loaded page:", pageNum);
    } catch (err) {
      console.error("Failed to fetch pagination:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (showSubHeader && !apiResponse) {
      fetchMaterials();
    }
  }, [showSubHeader]);

  return (
    <div className="h-screen w-full flex flex-col bg-gray-100 overflow-hidden">
      {/* Top Bar */}
      <div className="fixed top-0 left-0 w-full h-13 bg-[#7054D0] shadow-md flex items-center px-6 z-30">
        <h1 className="text-lg font-bold text-white">PyGrounds</h1>
      </div>

      <div className="flex flex-1 pt-13">
        {/* Sidebar */}
        <div className="fixed top-13 left-0 h-[calc(100vh-3.25rem)] w-64 bg-white shadow-md z-50">
          <Component.AdminSideNav nav={true} />
        </div>

        {/* Main Area */}
        <div className="flex-1 ml-64 mt-13 relative flex flex-col h-[calc(100vh-3.25rem)]">
          {showSubHeader && (
            <div className="fixed top-13 left-64 right-0 bg-gray-100 z-20 flex items-center justify-between px-6 py-3 border-b border-gray-300 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-700">
                Uploaded Reading Materials
              </h2>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-4 py-2 bg-[#6B5BD2] text-white rounded-lg font-semibold hover:bg-[#4c3aa6] transition"
                >
                  + Add Material
                </button>

                <span className="text-gray-700 font-semibold">
                  Page {currentPage}
                </span>

                <button
                  onClick={() =>
                    apiResponse?.previous && fetchMaterials(apiResponse.previous)
                  }
                  disabled={!apiResponse?.previous || isLoading}
                  className={`px-6 py-2 rounded-lg font-semibold shadow-md transition-all duration-200 ${
                    apiResponse?.previous
                      ? "bg-[#6B5BD2] text-white hover:bg-[#4c3aa6]"
                      : "bg-[#b0b0b0] text-gray-200 cursor-not-allowed"
                  }`}
                >
                  Back
                </button>

                <button
                  onClick={() =>
                    apiResponse?.next && fetchMaterials(apiResponse.next)
                  }
                  disabled={!apiResponse?.next || isLoading}
                  className={`px-6 py-2 rounded-lg font-semibold shadow-md transition-all duration-200 ${
                    apiResponse?.next
                      ? "bg-[#6B5BD2] text-white hover:bg-[#4c3aa6]"
                      : "bg-[#b0b0b0] text-gray-200 cursor-not-allowed"
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}

          <div
            className={`overflow-y-auto bg-gray-100 px-6 pb-6 flex-1 ${
              showSubHeader ? "pt-[3.2rem]" : "pt-4"
            }`}
          >
            <Outlet
              key={currentPage}
              context={{
                apiResponse,
                onFetch: fetchMaterials,
                isLoading,
              }}
            />
          </div>
        </div>
      </div>

      {showAddModal && (
        <AddMaterialModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            fetchMaterials();
            setShowAddModal(false);
          }}
        />
      )}
    </div>
  );
};

export default AdminMain;
