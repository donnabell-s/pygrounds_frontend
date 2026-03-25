import { useState, useRef } from "react";
import * as Components from "../../../components";
import { FiMenu } from "react-icons/fi";
import ReadingMaterialUser from "./ReadingMaterialUser";
import type { ReadingMaterialUserRef } from "./ReadingMaterialUser";
import { TbLayoutSidebarFilled } from "react-icons/tb";


const PythonLearn = () => {
  const [menuOpen, setMenuOpen] = useState(true);
  const [activeSubtopic, setActiveSubtopic] = useState<number | null>(null);

  // Connect ReadingMaterialUser methods
  const readerRef = useRef<ReadingMaterialUserRef>(null);

  const handleSelectSubtopic = (id: number) => {
    if (readerRef.current) {
      readerRef.current.jumpToSubtopic(id);
      setActiveSubtopic(id);
    }
  };

  return (
    <div className="flex flex-col gap-8 py-8">
      {/* Header */}
      <div className="flex flex-row items-center gap-1">
        <button
          onClick={() => setMenuOpen((prev) => !prev)}
          className={`cursor-pointer mt-1.5 ${
            menuOpen ? "text-[#3776AB]" : "text-gray-600 hover:text-[#3776AB]"
          }`}
        >
          <TbLayoutSidebarFilled size={29} />
        </button>
        <h1 className="text-3xl font-bold">Python Learning Course</h1>
      </div>

      {/* Layout */}
      <div className="flex flex-row gap-2">
        {/* Sidebar */}
        <div
          className={`flex-shrink-0  rounded-md overflow-y-auto transition-all duration-300
            ${menuOpen ? "w-60" : "w-0"}
          `}
        >
          <Components.TopicMenu
            activeSubtopic={activeSubtopic}
            onSelectSubtopic={handleSelectSubtopic}
          />
        </div>

        {/* Reading Content */}
        <div className="flex-1 transition-all duration-300 max-w-screen-lg">
          <ReadingMaterialUser
            ref={readerRef}
            setActiveSubtopic={setActiveSubtopic}
          />
        </div>
      </div>
    </div>
  );
};

export default PythonLearn;
