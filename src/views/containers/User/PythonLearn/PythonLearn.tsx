import { useState } from "react";
import * as Components from "../../../components";
import { FiMenu } from "react-icons/fi";
import ReadingMaterialUser from "./ReadingMaterialUser"; // ✅ new import for user-side reading view

const PythonLearn = () => {
  const [menuOpen, setMenuOpen] = useState(true);

  return (
    <div className="flex flex-col gap-4 py-8">
      {/* Header */}
      <div className="flex flex-row items-center gap-2">
        <button
          onClick={() => setMenuOpen((prev) => !prev)}
          className={`focus:outline-none cursor-pointer ${
            menuOpen ? "text-[#3776AB]" : "text-[#6B7280] hover:text-[#3776AB]"
          }`}
        >
          <FiMenu size={24} />
        </button>
        <h1 className="text-3xl font-semibold">Python Learning Course</h1>
      </div>

      {/* Content Area */}
      <div className="flex flex-row gap-2">
        {/* Sidebar */}
        <div
          className={`
            shadow-md rounded-md overflow-hidden
            transition-[width] duration-300
            ${menuOpen ? "w-[30%] md:w-[22%]" : "w-0"}
          `}
        >
          <Components.TopicMenu />
        </div>

        {/* Main Reading Content (User View) */}
        <div className="flex-1 transition-all duration-300">
          <ReadingMaterialUser />
        </div>
      </div>
    </div>
  );
};

export default PythonLearn;
